import { Prisma } from '@prisma/client';
import {
  CompetitionDocumentsSummary,
  CompetitionPerformance,
  DataSource,
  ExecutiveSummary,
  RecruitmentCycle,
  RecruitmentDivisionCount,
  Competition,
  Term
} from 'shared';
import {
  ExecutiveSummaryQueryArgs,
  RecruitmentCycleQueryArgs,
  RecruitmentDivisionCountQueryArgs
} from '../prisma-query-args/executive-summary.query-args.js';
import { carTransformer } from './cars.transformer.js';
import { teamTypeTransformer } from './team-types.transformer.js';
import { userTransformer } from './user.transformer.js';

export const executiveSummaryTransformer = (
  executiveSummary: Prisma.Executive_SummaryGetPayload<ExecutiveSummaryQueryArgs>
): ExecutiveSummary => {
  return {
    executiveSummaryId: executiveSummary.executiveSummaryId,
    car: carTransformer(executiveSummary.car),
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
  competitionPerformance: Prisma.Competition_PerformanceGetPayload<null>
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
  competitionDocumentsSummary: Prisma.Competition_Documents_SummaryGetPayload<null>
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

export const recruitmentCycleTransformer = (
  recruitmentCycle: Prisma.Recruitment_CycleGetPayload<RecruitmentCycleQueryArgs>
): RecruitmentCycle => {
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
  divisionCount: Prisma.Recruitment_Division_CountGetPayload<RecruitmentDivisionCountQueryArgs>
): RecruitmentDivisionCount => {
  return {
    recruitmentDivisionCountId: divisionCount.recruitmentDivisionCountId,
    recruitmentCycleId: divisionCount.recruitmentCycleId,
    teamType: teamTypeTransformer(divisionCount.teamType),
    newMembers: divisionCount.newMembers ?? undefined,
    returningMembers: divisionCount.returningMembers ?? undefined
  };
};
