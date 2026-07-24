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
  wbsElement: {
    include: {
      workPackage: true
    }
  }
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

  /**
   * An accepted stage-gate request should only exist when every description
   * bullet belonging to that work package has already been checked.
   *
   * For each work package, use its earliest accepted stage-gate CR as the
   * point when its bullets became checked.
   */
  private async checkBulletsForAcceptedStageGates(changeRequests: SeededChangeRequest[]): Promise<void> {
    const earliestStageGateByWbsElementId = new Map<string, SeededChangeRequest>();

    for (const cr of changeRequests) {
      if (!cr.accepted) continue;
      if (cr.type !== CR_Type.STAGE_GATE) continue;
      if (!cr.wbsElementId || !cr.wbsElement?.workPackage) continue;

      const current = earliestStageGateByWbsElementId.get(cr.wbsElementId);

      if (!current || cr.dateSubmitted < current.dateSubmitted) {
        earliestStageGateByWbsElementId.set(cr.wbsElementId, cr);
      }
    }

    await Promise.all(
      Array.from(earliestStageGateByWbsElementId.values()).map((cr) => {
        const checkerId = cr.reviewerId ?? cr.submitterId;

        return this.prisma.description_Bullet.updateMany({
          where: {
            wbsElementId: cr.wbsElementId!
          },
          data: {
            userCheckedId: checkerId,
            dateTimeChecked: cr.dateSubmitted
          }
        });
      })
    );
  }

  /**
   * Apply accepted activation, stage-gate, and leadership CRs to their WBS
   * elements in chronological order.
   *
   * Handling them together ensures that the final lead and manager come from
   * the latest accepted CR rather than one CR type always overwriting another.
   */
  private async applyAcceptedWbsChanges(changeRequests: SeededChangeRequest[]): Promise<void> {
    const changeRequestsByWbsElementId = new Map<string, SeededChangeRequest[]>();

    for (const cr of changeRequests) {
      if (!cr.accepted || !cr.wbsElementId || !cr.wbsElement) continue;

      const affectsWbsElement =
        cr.type === CR_Type.ACTIVATION || cr.type === CR_Type.STAGE_GATE || cr.type === CR_Type.LEADERSHIP;

      if (!affectsWbsElement) continue;

      const list = changeRequestsByWbsElementId.get(cr.wbsElementId) ?? [];
      list.push(cr);
      changeRequestsByWbsElementId.set(cr.wbsElementId, list);
    }

    await Promise.all(Array.from(changeRequestsByWbsElementId.values()).map((crs) => this.applyWbsElementChanges(crs)));
  }

  private async applyWbsElementChanges(changeRequests: SeededChangeRequest[]): Promise<void> {
    const wbsElement = changeRequests[0].wbsElement;

    if (!wbsElement) return;

    const workPackage = wbsElement.workPackage;

    const ordered = [...changeRequests].sort((a, b) => a.dateSubmitted.getTime() - b.dateSubmitted.getTime());

    let leadId = wbsElement.leadId;
    let managerId = wbsElement.managerId;
    let status: WBS_Element_Status = wbsElement.status;

    let startDate = workPackage?.startDate;
    let duration = workPackage?.duration;

    for (const cr of ordered) {
      if (cr.type === CR_Type.ACTIVATION && cr.activationChangeRequest && workPackage) {
        startDate = cr.activationChangeRequest.startDate;

        leadId = cr.activationChangeRequest.leadId ?? leadId;
        managerId = cr.activationChangeRequest.managerId ?? managerId;

        status = WBS_Element_Status.ACTIVE;
      } else if (cr.type === CR_Type.STAGE_GATE && cr.stageGateChangeRequest && workPackage && startDate) {
        const completedDate = cr.dateReviewed ?? cr.dateSubmitted;

        duration = Math.max(1, Math.round((completedDate.getTime() - startDate.getTime()) / WEEK_MS));

        status = WBS_Element_Status.COMPLETE;
      } else if (cr.type === CR_Type.LEADERSHIP && cr.leadershipChangeRequest) {
        leadId = cr.leadershipChangeRequest.leadId ?? leadId;
        managerId = cr.leadershipChangeRequest.managerId ?? managerId;
      }
    }

    await this.prisma.wBS_Element.update({
      where: {
        wbsElementId: wbsElement.wbsElementId
      },
      data: {
        status,
        ...(leadId
          ? {
              lead: {
                connect: {
                  userId: leadId
                }
              }
            }
          : {}),
        ...(managerId
          ? {
              manager: {
                connect: {
                  userId: managerId
                }
              }
            }
          : {})
      }
    });

    if (workPackage && startDate && duration !== undefined) {
      await this.prisma.work_Package.update({
        where: {
          workPackageId: workPackage.workPackageId
        },
        data: {
          startDate,
          duration
        }
      });
    }
  }

  private async applyAcceptedAccountCodeBudgets(changeRequests: SeededChangeRequest[]): Promise<void> {
    const latestBudgetByAccountCode = new Map<
      string,
      {
        dateSubmitted: Date;
        proposedBudget: number;
      }
    >();

    for (const cr of changeRequests) {
      if (!cr.accepted || !cr.accountCodeId || !cr.budgetChangeRequest) {
        continue;
      }

      const current = latestBudgetByAccountCode.get(cr.accountCodeId);

      if (!current || cr.dateSubmitted >= current.dateSubmitted) {
        latestBudgetByAccountCode.set(cr.accountCodeId, {
          dateSubmitted: cr.dateSubmitted,
          proposedBudget: cr.budgetChangeRequest.proposedBudget
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
  ): Promise<{
    submitters: SeedCrActor[];
    reviewers: SeedCrActor[];
  }> {
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

    if (submitterPool.length === 0 || reviewerPool.length === 0) {
      throw new Error('ChangeRequestProcess requires submitters and reviewers.');
    }

    const wbsChangeRequestInputs: Prisma.Change_RequestCreateInput[] = [];
    const now = new Date();

    for (const { project, timeline } of projects) {
      // Future projects should not have change requests yet.
      if (timeline.start.getTime() > now.getTime()) continue;

      const projectWorkPackages = workPackagesByProjectId[project.projectId] ?? [];

      const { leadId: projectLeadId, managerId: projectManagerId } = project.wbsElement;

      const projectParent: SeedCrParent = {
        wbsElementId: project.wbsElementId,
        timeline,
        leadId: projectLeadId ?? undefined,
        managerId: projectManagerId ?? undefined
      };

      wbsChangeRequestInputs.push(
        ...buildWbsChangeRequests(
          this.faker,
          projectParent,
          false,
          this.allocateIdentifiers(crCountForProject(this.faker)),
          organizationId,
          submitterPool,
          reviewerPool
        )
      );

      for (const { workPackage, timeline: wpTimeline } of projectWorkPackages) {
        // A started project may still contain future work packages.
        if (wpTimeline.start.getTime() > now.getTime()) continue;

        const { leadId: wpLeadId, managerId: wpManagerId } = workPackage.wbsElement;

        const wpParent: SeedCrParent = {
          wbsElementId: workPackage.wbsElement.wbsElementId,
          timeline: wpTimeline,
          leadId: wpLeadId ?? undefined,
          managerId: wpManagerId ?? undefined
        };

        wbsChangeRequestInputs.push(
          ...buildWbsChangeRequests(
            this.faker,
            wpParent,
            true,
            this.allocateIdentifiers(crCountForWorkPackage(this.faker)),
            organizationId,
            submitterPool,
            reviewerPool
          )
        );
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
        financeReviewers
      )
    );

    const createdWbsChangeRequests = await this.createChangeRequests(wbsChangeRequestInputs);

    const createdBudgetChangeRequests = await this.createChangeRequests(budgetChangeRequestInputs);

    /*
     * Make stage-gate seed data valid before applying the accepted lifecycle
     * changes to the work packages.
     */
    await this.checkBulletsForAcceptedStageGates(createdWbsChangeRequests);

    await this.applyAcceptedWbsChanges(createdWbsChangeRequests);

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
