import { Change_Request, CR_Type, Prisma, WBS_Element_Status } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { DescriptionBulletProcess } from './description-bullet.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { DateRange } from '../context.js';
import { WEEK_MS } from '../dates.js';
import {
  buildAccountCodeChangeRequests,
  buildWbsChangeRequests,
  crCountForAccountCode,
  crCountForProject,
  crCountForWorkPackage,
  SeedCrActor,
  SeedCrParent
} from '../factories/change-request.factory.js';

type ChangeRequestInput = OrganizationOutput &
  ProjectOutput &
  UsersOutput &
  WorkPackageOutput &
  ConfigDataOutput &
  TeamOutput;

export type ChangeRequestOutput = {
  changeRequests: Change_Request[];
  changeRequestsByWbsElementId: Record<string, Change_Request[]>;
};

const changeRequestInclude = {
  activationChangeRequest: true,
  stageGateChangeRequest: true,
  budgetChangeRequest: true,
  leadershipChangeRequest: true,
  wbsProposedChanges: { include: { projectProposedChanges: true, workPackageProposedChanges: true } },
  wbsElement: { include: { workPackage: true, project: true } }
} satisfies Prisma.Change_RequestInclude;

type SeededChangeRequest = Prisma.Change_RequestGetPayload<{
  include: typeof changeRequestInclude;
}>;

export class ChangeRequestProcess extends SeedProcess<ChangeRequestInput, ChangeRequestOutput> {
  private identifierCounter = 1;

  dependencies() {
    return [
      OrganizationProcess,
      ProjectProcess,
      UsersProcess,
      WorkPackageProcess,
      ConfigDataProcess,
      TeamProcess,
      DescriptionBulletProcess
    ];
  }

  private allocateIdentifiers(count: number): number[] {
    const identifiers = Array.from({ length: count }, (_, offset) => this.identifierCounter + offset);
    this.identifierCounter += count;
    return identifiers;
  }

  private async createChangeRequests(inputs: Prisma.Change_RequestCreateInput[]): Promise<SeededChangeRequest[]> {
    return Promise.all(
      inputs.map((data) =>
        this.prisma.change_Request.create({
          data,
          include: changeRequestInclude
        })
      )
    );
  }

  private async applyAcceptedWbsChanges(changeRequests: SeededChangeRequest[]): Promise<void> {
    const workPackageCrs = new Map<string, SeededChangeRequest[]>();

    for (const cr of changeRequests) {
      if (!cr.accepted || !cr.wbsElement?.workPackage) continue;
      if (cr.type !== CR_Type.ACTIVATION && cr.type !== CR_Type.STAGE_GATE && cr.type !== CR_Type.STANDARD) continue;

      const list = workPackageCrs.get(cr.wbsElement.wbsElementId) ?? [];
      list.push(cr);
      workPackageCrs.set(cr.wbsElement.wbsElementId, list);
    }

    await Promise.all(Array.from(workPackageCrs.values()).map((crs) => this.applyWorkPackageLifecycle(crs)));
  }
  /**
   * Replays every accepted ACTIVATION/STAGE_GATE/STANDARD CR for one work package in chronological
   * order. STANDARD CRs are folded into this same replay (rather than a separate pass) because
   * editWorkPackage unconditionally reverts a COMPLETE work package back to ACTIVE on any edit -
   * that only makes sense evaluated in the same chronological sequence as the CRs that drive
   * status via ACTIVATION/STAGE_GATE.
   */
  private async applyWorkPackageLifecycle(crs: SeededChangeRequest[]): Promise<void> {
    const [firstCr] = crs;
    const { wbsElement } = firstCr;
    const { workPackage } = wbsElement ?? {};

    if (!workPackage || !wbsElement) return;

    const ordered = [...crs].sort((a, b) => a.dateSubmitted.getTime() - b.dateSubmitted.getTime());

    let { startDate, duration, stage } = workPackage;
    let { leadId, managerId, name } = wbsElement;
    let status: WBS_Element_Status = WBS_Element_Status.INACTIVE;

    for (const cr of ordered) {
      const { type, activationChangeRequest, dateReviewed, dateSubmitted, wbsProposedChanges } = cr;

      if (type === CR_Type.ACTIVATION && activationChangeRequest) {
        ({ startDate, leadId, managerId } = activationChangeRequest);
        status = WBS_Element_Status.ACTIVE;
      } else if (type === CR_Type.STAGE_GATE) {
        const completedDate = dateReviewed ?? dateSubmitted;

        duration = Math.max(1, Math.round((completedDate.getTime() - startDate.getTime()) / WEEK_MS));

        status = WBS_Element_Status.COMPLETE;
      } else if (type === CR_Type.STANDARD && wbsProposedChanges) {
        name = wbsProposedChanges.name;
        leadId = wbsProposedChanges.leadId;
        managerId = wbsProposedChanges.managerId;
        if (wbsProposedChanges.workPackageProposedChanges) {
          stage = wbsProposedChanges.workPackageProposedChanges.stage;
        }
        if (status === WBS_Element_Status.COMPLETE) {
          status = WBS_Element_Status.ACTIVE;
        }
      }
    }

    await this.prisma.work_Package.update({
      where: {
        workPackageId: workPackage.workPackageId
      },
      data: {
        startDate,
        duration,
        stage,
        wbsElement: {
          update: {
            name,
            leadId,
            managerId,
            status
          }
        }
      }
    });
  }

  /**
   * Both LEADERSHIP CRs and STANDARD CRs (via their proposed lead/manager) can change a WBS
   * element's lead/manager, so both are merged into one "latest accepted CR wins" comparison
   * per WBS element rather than picking a winner independently per type. Work-package-level
   * STANDARD CRs are excluded here since applyWorkPackageLifecycle already handles them (LEADERSHIP
   * CRs are never generated for work packages, so this function only ever runs for projects).
   */
  private async applyAcceptedLeadManagerChanges(changeRequests: SeededChangeRequest[]): Promise<void> {
    type LeadManagerCandidate = { dateSubmitted: Date; leadId: string | null; managerId: string | null };
    const latestByWbsElementId = new Map<string, LeadManagerCandidate>();

    const consider = (
      wbsElementId: string | null | undefined,
      dateSubmitted: Date,
      leadId: string | null,
      managerId: string | null
    ) => {
      if (!wbsElementId) return;
      const current = latestByWbsElementId.get(wbsElementId);
      if (!current || dateSubmitted >= current.dateSubmitted) {
        latestByWbsElementId.set(wbsElementId, { dateSubmitted, leadId, managerId });
      }
    };

    for (const cr of changeRequests) {
      if (!cr.accepted) continue;

      if (cr.type === CR_Type.LEADERSHIP && cr.leadershipChangeRequest) {
        consider(cr.wbsElementId, cr.dateSubmitted, cr.leadershipChangeRequest.leadId, cr.leadershipChangeRequest.managerId);
      } else if (cr.type === CR_Type.STANDARD && cr.wbsProposedChanges && !cr.wbsElement?.workPackage) {
        consider(cr.wbsElementId, cr.dateSubmitted, cr.wbsProposedChanges.leadId, cr.wbsProposedChanges.managerId);
      }
    }

    await Promise.all(
      Array.from(latestByWbsElementId.entries()).map(([wbsElementId, { leadId, managerId }]) =>
        this.prisma.wBS_Element.update({
          where: { wbsElementId },
          data: { leadId, managerId }
        })
      )
    );
  }

  /**
   * Applies the non lead/manager fields a project-level STANDARD CR can propose (name/budget/summary)
   * using the latest accepted STANDARD CR per project. Work-package-level STANDARD CRs are handled by
   * applyWorkPackageLifecycle instead, since they interact with ACTIVATION/STAGE_GATE's status/stage
   * state machine. Description bullets/links are deliberately left untouched since the proposal always
   * copies them through unchanged (see buildStandardProposedChanges).
   */
  private async applyAcceptedStandardChanges(changeRequests: SeededChangeRequest[]): Promise<void> {
    const latestByWbsElementId = new Map<string, SeededChangeRequest>();

    for (const cr of changeRequests) {
      if (!cr.accepted || cr.type !== CR_Type.STANDARD || !cr.wbsElementId || !cr.wbsProposedChanges) continue;
      if (cr.wbsElement?.workPackage) continue;

      const current = latestByWbsElementId.get(cr.wbsElementId);
      if (!current || cr.dateSubmitted >= current.dateSubmitted) {
        latestByWbsElementId.set(cr.wbsElementId, cr);
      }
    }

    await Promise.all(
      Array.from(latestByWbsElementId.entries()).map(async ([wbsElementId, cr]) => {
        const proposal = cr.wbsProposedChanges;
        if (!proposal) return;

        await this.prisma.wBS_Element.update({
          where: { wbsElementId },
          data: { name: proposal.name }
        });

        if (proposal.projectProposedChanges && cr.wbsElement?.project) {
          await this.prisma.project.update({
            where: { projectId: cr.wbsElement.project.projectId },
            data: {
              budget: proposal.projectProposedChanges.budget,
              summary: proposal.projectProposedChanges.summary
            }
          });
        }
      })
    );
  }

  private async applyAcceptedAccountCodeBudgets(changeRequests: SeededChangeRequest[]): Promise<void> {
    const latestBudgetByAccountCode = new Map<string, { dateSubmitted: Date; proposedBudget: number }>();

    for (const cr of changeRequests) {
      const { accepted, accountCodeId, budgetChangeRequest, dateSubmitted } = cr;

      if (!accepted || !accountCodeId || !budgetChangeRequest) continue;

      const current = latestBudgetByAccountCode.get(accountCodeId);
      const { proposedBudget } = budgetChangeRequest;

      if (!current || dateSubmitted >= current.dateSubmitted) {
        latestBudgetByAccountCode.set(accountCodeId, {
          dateSubmitted,
          proposedBudget
        });
      }
    }

    await Promise.all(
      Array.from(latestBudgetByAccountCode.entries()).map(([accountCodeId, { proposedBudget }]) =>
        this.prisma.account_Code.update({
          where: {
            accountCodeId
          },
          data: {
            amount: proposedBudget
          }
        })
      )
    );
  }

  private async resolveFinanceActors(
    financeTeamId: string,
    fallbackSubmitters: SeedCrActor[],
    fallbackReviewers: SeedCrActor[]
  ): Promise<{ submitters: SeedCrActor[]; reviewers: SeedCrActor[] }> {
    const financeTeam = await this.prisma.team.findUnique({
      where: {
        teamId: financeTeamId
      },
      include: {
        members: true,
        leads: true,
        head: true
      }
    });

    if (!financeTeam) {
      return {
        submitters: fallbackSubmitters,
        reviewers: fallbackReviewers
      };
    }

    const reviewers = [...financeTeam.leads, financeTeam.head];
    const submitters = [...financeTeam.members, ...reviewers];

    return {
      submitters: submitters.length > 0 ? submitters : fallbackSubmitters,
      reviewers: reviewers.length > 0 ? reviewers : fallbackReviewers
    };
  }

  async run({
    organization,
    projects,
    workPackagesByProjectId,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    accountCodes,
    financeTeam
  }: ChangeRequestInput): Promise<ChangeRequestOutput> {
    const { organizationId } = organization;

    if (projects.length === 0) {
      throw new Error('ChangeRequestProcess requires at least one project.');
    }

    this.identifierCounter = 1;

    const submitterPool = [...members, ...leadership, ...heads, ...admins, ...appAdmins];
    const reviewerPool = [...leadership, ...heads, ...admins, ...appAdmins];
    const headOrAdminUserIds = new Set([...heads, ...admins, ...appAdmins].map(({ userId }) => userId));

    if (submitterPool.length === 0 || reviewerPool.length === 0) {
      throw new Error('ChangeRequestProcess requires submitters and reviewers.');
    }

    const wbsChangeRequestInputs: Prisma.Change_RequestCreateInput[] = [];
    const now = new Date();

    const [allBullets, allLinks, allWorkPackages] = await Promise.all([
      this.prisma.description_Bullet.findMany({ where: { dateDeleted: null, wbsElementId: { not: null } } }),
      this.prisma.link.findMany({ where: { dateDeleted: null, wbsElementId: { not: null } } }),
      this.prisma.work_Package.findMany({ select: { workPackageId: true, blockedBy: { select: { wbsElementId: true } } } })
    ]);

    const blockedByByWorkPackageId = new Map<string, string[]>(
      allWorkPackages.map((wp) => [wp.workPackageId, wp.blockedBy.map((b) => b.wbsElementId)])
    );

    const bulletsByWbsElementId = new Map<string, { detail: string; descriptionBulletTypeId: string }[]>();
    for (const bullet of allBullets) {
      if (!bullet.wbsElementId) continue;
      const list = bulletsByWbsElementId.get(bullet.wbsElementId) ?? [];
      list.push({ detail: bullet.detail, descriptionBulletTypeId: bullet.descriptionBulletTypeId });
      bulletsByWbsElementId.set(bullet.wbsElementId, list);
    }

    const linksByWbsElementId = new Map<string, { url: string; linkTypeId: string }[]>();
    for (const link of allLinks) {
      if (!link.wbsElementId) continue;
      const list = linksByWbsElementId.get(link.wbsElementId) ?? [];
      list.push({ url: link.url, linkTypeId: link.linkTypeId });
      linksByWbsElementId.set(link.wbsElementId, list);
    }

    for (const { project, timeline } of projects) {
      if (timeline.start.getTime() > now.getTime()) continue;

      const projectWorkPackages = workPackagesByProjectId[project.projectId] ?? [];

      const { leadId: projectLeadId, managerId: projectManagerId } = project.wbsElement;

      const projectParent: SeedCrParent = {
        wbsElementId: project.wbsElementId,
        timeline,
        leadId: projectLeadId ?? undefined,
        managerId: projectManagerId ?? undefined,
        name: project.wbsElement.name,
        status: project.wbsElement.status,
        descriptionBullets: bulletsByWbsElementId.get(project.wbsElementId) ?? [],
        links: linksByWbsElementId.get(project.wbsElementId) ?? [],
        project: { budget: project.budget, summary: project.summary, teamIds: project.teams.map((team) => team.teamId) }
      };

      wbsChangeRequestInputs.push(
        ...buildWbsChangeRequests(
          this.faker,
          projectParent,
          false,
          this.allocateIdentifiers(crCountForProject(this.faker)),
          organizationId,
          submitterPool,
          reviewerPool,
          headOrAdminUserIds
        )
      );

      for (const { workPackage, timeline: wpTimeline } of projectWorkPackages) {
        if (wpTimeline.start.getTime() > now.getTime()) continue;

        const { leadId: wpLeadId, managerId: wpManagerId } = workPackage.wbsElement;

        const wpParent: SeedCrParent = {
          wbsElementId: workPackage.wbsElement.wbsElementId,
          timeline: wpTimeline,
          leadId: wpLeadId ?? undefined,
          managerId: wpManagerId ?? undefined,
          name: workPackage.wbsElement.name,
          status: workPackage.wbsElement.status,
          descriptionBullets: bulletsByWbsElementId.get(workPackage.wbsElement.wbsElementId) ?? [],
          links: linksByWbsElementId.get(workPackage.wbsElement.wbsElementId) ?? [],
          workPackage: {
            startDate: workPackage.startDate,
            duration: workPackage.duration,
            stage: workPackage.stage,
            blockedByWbsElementIds: blockedByByWorkPackageId.get(workPackage.workPackageId) ?? []
          }
        };

        const workPackageChangeRequestInputs = buildWbsChangeRequests(
          this.faker,
          wpParent,
          true,
          this.allocateIdentifiers(crCountForWorkPackage(this.faker)),
          organizationId,
          submitterPool,
          reviewerPool,
          headOrAdminUserIds
        );

        const acceptedStageGate = workPackageChangeRequestInputs.find(
          (input) => input.type === CR_Type.STAGE_GATE && input.accepted === true
        );

        if (acceptedStageGate) {
          if (!acceptedStageGate.dateSubmitted) {
            throw new Error('Accepted stage-gate change request requires a submission date.');
          }

          const dateTimeChecked = new Date(acceptedStageGate.dateSubmitted);
          dateTimeChecked.setMilliseconds(dateTimeChecked.getMilliseconds() - 1);

          await this.prisma.description_Bullet.updateMany({
            where: {
              wbsElementId: workPackage.wbsElement.wbsElementId
            },
            data: {
              userCheckedId: wpLeadId ?? wpManagerId ?? this.faker.helpers.arrayElement(reviewerPool).userId,
              dateTimeChecked
            }
          });
        }

        wbsChangeRequestInputs.push(...workPackageChangeRequestInputs);
      }
    }

    const financeWindow = this.financeWindow(projects.map(({ timeline }) => timeline));

    const { submitters: financeSubmitters, reviewers: financeReviewers } = await this.resolveFinanceActors(
      financeTeam.teamId,
      submitterPool,
      reviewerPool
    );

    const budgetChangeRequestInputs = accountCodes.flatMap((accountCode) =>
      buildAccountCodeChangeRequests(
        this.faker,
        accountCode,
        financeWindow,
        this.allocateIdentifiers(crCountForAccountCode(this.faker)),
        organizationId,
        financeSubmitters,
        financeReviewers,
        headOrAdminUserIds
      )
    );

    const createdWbsChangeRequests = await this.createChangeRequests(wbsChangeRequestInputs);
    const createdBudgetChangeRequests = await this.createChangeRequests(budgetChangeRequestInputs);

    await this.applyAcceptedWbsChanges(createdWbsChangeRequests);
    await this.applyAcceptedLeadManagerChanges(createdWbsChangeRequests);
    await this.applyAcceptedStandardChanges(createdWbsChangeRequests);
    await this.applyAcceptedAccountCodeBudgets(createdBudgetChangeRequests);

    const changeRequests = [...createdWbsChangeRequests, ...createdBudgetChangeRequests];

    const changeRequestsByWbsElementId = changeRequests.reduce<Record<string, Change_Request[]>>((acc, cr) => {
      if (cr.wbsElementId) {
        acc[cr.wbsElementId] ??= [];
        acc[cr.wbsElementId].push(cr);
      }

      return acc;
    }, {});

    return {
      changeRequests,
      changeRequestsByWbsElementId
    };
  }

  private financeWindow(timelines: DateRange[]): DateRange {
    const starts = timelines.map(({ start }) => start.getTime());
    const ends = timelines.map(({ end }) => end.getTime());

    return {
      start: new Date(Math.min(...starts)),
      end: new Date(Math.max(...ends))
    };
  }
}
