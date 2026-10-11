import { Prisma, Reimbursement_Status_Type } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getTeamBaseQueryArgs } from './teams.query-args.js';

export type ExecutiveSummaryQueryArgs = ReturnType<typeof getExecutiveSummaryQueryArgs>;
export type VehicleDevelopmentProjectQueryArgs = ReturnType<typeof getVehicleDevelopmentProjectQueryArgs>;
export type BudgetProjectQueryArgs = ReturnType<typeof getBudgetProjectQueryArgs>;
export type RecruitmentCycleQueryArgs = ReturnType<typeof getRecruitmentCycleQueryArgs>;
export type RecruitmentDivisionCountQueryArgs = ReturnType<typeof getRecruitmentDivisionCountQueryArgs>;

export const getExecutiveSummaryQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Executive_SummaryDefaultArgs>()({
    include: {
      car: { select: { wbsElement: { select: { organizationId: true, name: true } } } },
      userCreated: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      competitionPerformances: true,
      competitionDocumentsSummary: true,
      recruitmentCycles: getRecruitmentCycleQueryArgs()
    }
  });

export const getRecruitmentCycleQueryArgs = () =>
  Prisma.validator<Prisma.Recruitment_CycleDefaultArgs>()({
    include: {
      divisionCounts: getRecruitmentDivisionCountQueryArgs()
    }
  });

export const getRecruitmentDivisionCountQueryArgs = () =>
  Prisma.validator<Prisma.Recruitment_Division_CountDefaultArgs>()({
    include: {
      teamType: true
    }
  });

export const getVehicleDevelopmentProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
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
            reimbursementStatuses: { some: { type: Reimbursement_Status_Type.REIMBURSED } }
          }
        },
        select: { cost: true }
      }
    }
  }
});

export const getBudgetProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
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
