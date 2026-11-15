import { Prisma } from '@prisma/client';
import {
  CompetitionDocumentsSummary,
  CompetitionPerformance,
  DataSource,
  ExecutiveSummary,
  RecruitmentCycle,
  RecruitmentDivisionCount,
  Competition,
  Term,
  VehicleDevelopmentProjectSummary,
  VehicleDevelopmentSummary,
  calculateProjectEndDate,
  calculateProjectStartDate
} from 'shared';
import {
  BaseCompetitionDocumentsSummaryQueryArgs,
  BaseCompetitionPerformanceQueryArgs,
  BaseExecutiveSummaryQueryArgs,
  BaseRecruitmentCycleQueryArgs,
  BaseRecruitmentDivisionCountQueryArgs,
  VehicleDevelopmentProjectQueryArgs
} from '../prisma-query-args/executive-summary.query-args.js';
import { UserQueryArgs } from '../prisma-query-args/user.query-args.js';
import { teamBaseTransformer } from './teams.transformer.js';
import { teamTypeTransformer } from './team-types.transformer.js';
import { userTransformer } from './user.transformer.js';

type BaseExecutiveSummaryPayload = Prisma.Executive_SummaryGetPayload<BaseExecutiveSummaryQueryArgs>;
type CompetitionPerformancePayload = Prisma.Competition_PerformanceGetPayload<BaseCompetitionPerformanceQueryArgs>;
type CompetitionDocumentsSummaryPayload =
  Prisma.Competition_Documents_SummaryGetPayload<BaseCompetitionDocumentsSummaryQueryArgs>;
type RecruitmentDivisionCountPayload = Prisma.Recruitment_Division_CountGetPayload<BaseRecruitmentDivisionCountQueryArgs>;
type RecruitmentCyclePayload = Prisma.Recruitment_CycleGetPayload<BaseRecruitmentCycleQueryArgs> & {
  divisionCounts: RecruitmentDivisionCountPayload[];
};

/**
 * The base executive summary payload plus everything the full executive summary opts in to. Service functions are
 * responsible for selecting these fields on top of getBaseExecutiveSummaryQueryArgs.
 */
export type ExecutiveSummaryPayload = BaseExecutiveSummaryPayload & {
  goals: string;
  winsAndImprovements: string;
  budgetNotes: string;
  recruitmentNotes: string;
  userCreated: Prisma.UserGetPayload<UserQueryArgs>;
  deletedBy: Prisma.UserGetPayload<UserQueryArgs> | null;
  competitionPerformances: CompetitionPerformancePayload[];
  competitionDocumentsSummary: CompetitionDocumentsSummaryPayload | null;
  recruitmentCycles: RecruitmentCyclePayload[];
};

export const executiveSummaryTransformer = (executiveSummary: ExecutiveSummaryPayload): ExecutiveSummary => {
  return {
    executiveSummaryId: executiveSummary.executiveSummaryId,
    car: { name: executiveSummary.car.wbsElement.name },
    seasonStartDate: executiveSummary.seasonStartDate ?? undefined,
    seasonEndDate: executiveSummary.seasonEndDate ?? undefined,
    goals: executiveSummary.goals,
    winsAndImprovements: executiveSummary.winsAndImprovements,
    budgetNotes: executiveSummary.budgetNotes,
    recruitmentNotes: executiveSummary.recruitmentNotes,
    dateCreated: executiveSummary.dateCreated,
    userCreated: userTransformer(executiveSummary.userCreated),
    dateDeleted: executiveSummary.dateDeleted ?? undefined,
    deletedBy: executiveSummary.deletedBy ? userTransformer(executiveSummary.deletedBy) : undefined,
    competitionPerformances: executiveSummary.competitionPerformances.map(competitionPerformanceTransformer),
    competitionDocumentsSummary: executiveSummary.competitionDocumentsSummary
      ? competitionDocumentsSummaryTransformer(executiveSummary.competitionDocumentsSummary)
      : undefined,
    recruitmentCycles: executiveSummary.recruitmentCycles.map(recruitmentCycleTransformer)
  };
};

export const competitionPerformanceTransformer = (
  competitionPerformance: CompetitionPerformancePayload
): CompetitionPerformance => {
  return {
    competitionPerformanceId: competitionPerformance.competitionPerformanceId,
    executiveSummaryId: competitionPerformance.executiveSummaryId,
    competition: competitionPerformance.competition as Competition,
    finalPlace: competitionPerformance.finalPlace ?? undefined,
    totalPointsEarned: competitionPerformance.totalPointsEarned ?? undefined,
    maxPoints: competitionPerformance.maxPoints ?? undefined,
    bestStaticEvent: competitionPerformance.bestStaticEvent ?? undefined,
    worstStaticEvent: competitionPerformance.worstStaticEvent ?? undefined,
    bestDynamicEvent: competitionPerformance.bestDynamicEvent ?? undefined,
    worstDynamicEvent: competitionPerformance.worstDynamicEvent ?? undefined,
    accelerationTopTimeSeconds: competitionPerformance.accelerationTopTimeSeconds ?? undefined,
    autocrossTopTimeSeconds: competitionPerformance.autocrossTopTimeSeconds ?? undefined,
    enduranceLapsCompleted: competitionPerformance.enduranceLapsCompleted ?? undefined,
    maxLaps: competitionPerformance.maxLaps ?? undefined,
    enduranceAvgLapTimeSeconds: competitionPerformance.enduranceAvgLapTimeSeconds ?? undefined
  };
};

export const competitionDocumentsSummaryTransformer = (
  competitionDocumentsSummary: CompetitionDocumentsSummaryPayload
): CompetitionDocumentsSummary => {
  return {
    competitionDocumentsSummaryId: competitionDocumentsSummary.competitionDocumentsSummaryId,
    executiveSummaryId: competitionDocumentsSummary.executiveSummaryId,
    submittedOnTimeCount: competitionDocumentsSummary.submittedOnTimeCount ?? undefined,
    firstSubmissionRejectedCount: competitionDocumentsSummary.firstSubmissionRejectedCount ?? undefined,
    source: competitionDocumentsSummary.source as DataSource,
    dateSynced: competitionDocumentsSummary.dateSynced ?? undefined
  };
};

export const recruitmentCycleTransformer = (recruitmentCycle: RecruitmentCyclePayload): RecruitmentCycle => {
  return {
    recruitmentCycleId: recruitmentCycle.recruitmentCycleId,
    executiveSummaryId: recruitmentCycle.executiveSummaryId,
    term: recruitmentCycle.term as Term,
    eventsHeld: recruitmentCycle.eventsHeld ?? undefined,
    signUps: recruitmentCycle.signUps ?? undefined,
    onboarded: recruitmentCycle.onboarded ?? undefined,
    activeMembers: recruitmentCycle.activeMembers ?? undefined,
    divisionCounts: recruitmentCycle.divisionCounts.map(recruitmentDivisionCountTransformer)
  };
};

export const recruitmentDivisionCountTransformer = (
  divisionCount: RecruitmentDivisionCountPayload
): RecruitmentDivisionCount => {
  return {
    recruitmentDivisionCountId: divisionCount.recruitmentDivisionCountId,
    recruitmentCycleId: divisionCount.recruitmentCycleId,
    teamType: teamTypeTransformer(divisionCount.teamType),
    newMembers: divisionCount.newMembers ?? undefined,
    returningMembers: divisionCount.returningMembers ?? undefined
  };
};

export const vehicleDevelopmentSummaryTransformer = (
  executiveSummaryId: string,
  projects: Prisma.ProjectGetPayload<VehicleDevelopmentProjectQueryArgs>[]
): VehicleDevelopmentSummary => {
  const projectSummaries: VehicleDevelopmentProjectSummary[] = projects.flatMap((project) => {
    const startDate = calculateProjectStartDate(project.workPackages);
    const plannedEndDate = calculateProjectEndDate(project.workPackages);
    if (!startDate || !plannedEndDate) return [];

    return [
      {
        wbsElementId: project.wbsElementId,
        name: project.wbsElement.name,
        teams: project.teams.map(teamBaseTransformer),
        startDate,
        plannedEndDate
      }
    ];
  });

  return { executiveSummaryId, projects: projectSummaries };
};
