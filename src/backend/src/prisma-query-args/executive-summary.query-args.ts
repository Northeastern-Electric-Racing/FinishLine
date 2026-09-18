import { Prisma } from '@prisma/client';
import { getCarQueryArgs } from './cars.query-args.js';
import { getUserQueryArgs } from './user.query-args.js';

export type ExecutiveSummaryQueryArgs = ReturnType<typeof getExecutiveSummaryQueryArgs>;
export type RecruitmentCycleQueryArgs = ReturnType<typeof getRecruitmentCycleQueryArgs>;
export type RecruitmentDivisionCountQueryArgs = ReturnType<typeof getRecruitmentDivisionCountQueryArgs>;

export const getExecutiveSummaryQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Executive_SummaryDefaultArgs>()({
    include: {
      car: getCarQueryArgs(organizationId),
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
