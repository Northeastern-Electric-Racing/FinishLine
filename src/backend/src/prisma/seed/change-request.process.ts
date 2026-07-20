import { Change_Request, CR_Type, Prisma, WBS_Element_Status } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { DateRange } from '../context.js';
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
  budgetChangeRequest: true
} satisfies Prisma.Change_RequestInclude;

type SeededChangeRequest = Prisma.Change_RequestGetPayload<{ include: typeof changeRequestInclude }>;

export class ChangeRequestProcess extends SeedProcess<ChangeRequestInput, ChangeRequestOutput> {
  private identifierCounter = 1;

  dependencies() {
    return [OrganizationProcess, ProjectProcess, UsersProcess, WorkPackageProcess, ConfigDataProcess, TeamProcess];
  }

  private allocateIdentifiers(count: number): number[] {
    const identifiers = Array.from({ length: count }, (_, offset) => this.identifierCounter + offset);
    this.identifierCounter += count;
    return identifiers;
  }

  private async createChangeRequests(inputs: Prisma.Change_RequestCreateInput[]): Promise<SeededChangeRequest[]> {
    return Promise.all(inputs.map((data) => this.prisma.change_Request.create({ data, include: changeRequestInclude })));
  }

  private async applyAcceptedWbsStatuses(changeRequests: SeededChangeRequest[]): Promise<void> {
    const latestStatusByWbs = new Map<string, { dateSubmitted: Date; status: WBS_Element_Status }>();

    for (const cr of changeRequests) {
      if (!cr.accepted || !cr.wbsElementId) continue;

      const status =
        cr.type === CR_Type.ACTIVATION
          ? WBS_Element_Status.ACTIVE
          : cr.type === CR_Type.STAGE_GATE
            ? WBS_Element_Status.COMPLETE
            : undefined;

      if (!status) continue;

      const current = latestStatusByWbs.get(cr.wbsElementId);
      if (!current || cr.dateSubmitted >= current.dateSubmitted) {
        latestStatusByWbs.set(cr.wbsElementId, { dateSubmitted: cr.dateSubmitted, status });
      }
    }

    await Promise.all(
      Array.from(latestStatusByWbs.entries()).map(([wbsElementId, { status }]) =>
        this.prisma.wBS_Element.update({ where: { wbsElementId }, data: { status } })
      )
    );
  }

  private async applyAcceptedAccountCodeBudgets(changeRequests: SeededChangeRequest[]): Promise<void> {
    const latestBudgetByAccountCode = new Map<string, { dateSubmitted: Date; proposedBudget: number }>();

    for (const cr of changeRequests) {
      if (!cr.accepted || !cr.accountCodeId || !cr.budgetChangeRequest) continue;

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
        this.prisma.account_Code.update({ where: { accountCodeId }, data: { amount: proposedBudget } })
      )
    );
  }

  private async resolveFinanceActors(
    financeTeamId: string,
    fallbackSubmitters: SeedCrActor[],
    fallbackReviewers: SeedCrActor[]
  ): Promise<{ submitters: SeedCrActor[]; reviewers: SeedCrActor[] }> {
    const financeTeam = await this.prisma.team.findUnique({
      where: { teamId: financeTeamId },
      include: { members: true, leads: true, head: true }
    });

    if (!financeTeam) {
      return { submitters: fallbackSubmitters, reviewers: fallbackReviewers };
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

    for (const { project, timeline } of projects) {
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

    await this.applyAcceptedWbsStatuses(createdWbsChangeRequests);
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
