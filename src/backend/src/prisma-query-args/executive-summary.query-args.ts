import { Prisma, Reimbursement_Status_Type } from '@prisma/client';
import { getTeamBaseQueryArgs } from './teams.query-args.js';

export type BaseExecutiveSummaryQueryArgs = ReturnType<typeof getBaseExecutiveSummaryQueryArgs>;
export type BaseCompetitionPerformanceQueryArgs = ReturnType<typeof getBaseCompetitionPerformanceQueryArgs>;
export type BaseCompetitionDocumentsSummaryQueryArgs = ReturnType<typeof getBaseCompetitionDocumentsSummaryQueryArgs>;
export type BaseRecruitmentCycleQueryArgs = ReturnType<typeof getBaseRecruitmentCycleQueryArgs>;
export type BaseRecruitmentDivisionCountQueryArgs = ReturnType<typeof getBaseRecruitmentDivisionCountQueryArgs>;
export type VehicleDevelopmentProjectQueryArgs = ReturnType<typeof getVehicleDevelopmentProjectQueryArgs>;
export type BudgetProjectQueryArgs = ReturnType<typeof getBudgetProjectQueryArgs>;

const baseExecutiveSummarySelect = Prisma.validator<Prisma.Executive_SummarySelect>()({
  executiveSummaryId: true,
  carId: true,
  seasonStartDate: true,
  seasonEndDate: true,
  dateCreated: true,
  dateDeleted: true,
  car: { select: { wbsElement: { select: { organizationId: true, name: true } } } }
});

export const getBaseExecutiveSummaryQueryArgs = () =>
  Prisma.validator<Prisma.Executive_SummaryDefaultArgs>()({
    select: baseExecutiveSummarySelect
  });

export const getBaseCompetitionPerformanceQueryArgs = () =>
  Prisma.validator<Prisma.Competition_PerformanceDefaultArgs>()({
    select: {
      competitionPerformanceId: true,
      executiveSummaryId: true,
      competition: true,
      finalPlace: true,
      totalPointsEarned: true,
      maxPoints: true,
      bestStaticEvent: true,
      worstStaticEvent: true,
      bestDynamicEvent: true,
      worstDynamicEvent: true,
      accelerationTopTimeSeconds: true,
      autocrossTopTimeSeconds: true,
      enduranceLapsCompleted: true,
      maxLaps: true,
      enduranceAvgLapTimeSeconds: true
    }
  });

export const getBaseCompetitionDocumentsSummaryQueryArgs = () =>
  Prisma.validator<Prisma.Competition_Documents_SummaryDefaultArgs>()({
    select: {
      competitionDocumentsSummaryId: true,
      executiveSummaryId: true,
      submittedOnTimeCount: true,
      firstSubmissionRejectedCount: true,
      source: true,
      dateSynced: true
    }
  });

const baseRecruitmentCycleSelect = Prisma.validator<Prisma.Recruitment_CycleSelect>()({
  recruitmentCycleId: true,
  executiveSummaryId: true,
  term: true,
  eventsHeld: true,
  signUps: true,
  onboarded: true,
  activeMembers: true
});

export const getBaseRecruitmentCycleQueryArgs = () =>
  Prisma.validator<Prisma.Recruitment_CycleDefaultArgs>()({
    select: baseRecruitmentCycleSelect
  });

export const getBaseRecruitmentDivisionCountQueryArgs = () =>
  Prisma.validator<Prisma.Recruitment_Division_CountDefaultArgs>()({
    select: {
      recruitmentDivisionCountId: true,
      recruitmentCycleId: true,
      newMembers: true,
      returningMembers: true,
      teamType: true
    }
  });

export const getVehicleDevelopmentProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      wbsElementId: true,
      wbsElement: { select: { name: true } },
      teams: getTeamBaseQueryArgs(),
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        select: { startDate: true, duration: true }
      }
    }
  });

const reimbursedProductReasonsSelect = Prisma.validator<Prisma.WBS_ElementSelect>()({
  reimbursementProductReasons: {
    select: {
      reimbursementProduct: {
        where: {
          dateDeleted: null,
          reimbursementRequest: {
            dateDeleted: null,
            reimbursementStatuses: {
              some: { type: Reimbursement_Status_Type.REIMBURSED },
              none: { type: Reimbursement_Status_Type.DENIED }
            }
          }
        },
        select: { cost: true }
      }
    }
  }
});

export const getBudgetProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      budget: true,
      wbsElement: {
        select: {
          name: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          ...reimbursedProductReasonsSelect
        }
      },
      teams: getTeamBaseQueryArgs(),
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        select: {
          startDate: true,
          duration: true,
          wbsElement: { select: reimbursedProductReasonsSelect }
        }
      }
    }
  });
