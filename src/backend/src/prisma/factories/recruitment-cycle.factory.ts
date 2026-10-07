import { Faker } from '@faker-js/faker';
import { Prisma, Term } from '@prisma/client';

// Chance a given executive summary has a recruitment cycle for a given term - partial
// coverage, since older seasons may not have both terms' data recorded.
export const RECRUITMENT_CYCLE_CHANCE = 0.8;

export const ALL_TERMS: Term[] = [Term.FALL, Term.SPRING];

export type PlannedRecruitmentCycle = {
  term: Term;
  eventsHeld: number;
  signUps: number;
  onboarded: number;
  activeMembers: number;
};

export const planRecruitmentCycle = (faker: Faker, term: Term): PlannedRecruitmentCycle => {
  const signUps = faker.number.int({ min: 20, max: 150 });
  // Onboarded and active-after-onboarding are both bounded by the pool above them, never larger.
  const onboarded = Math.round(signUps * faker.number.float({ min: 0.3, max: 0.7 }));
  const activeMembers = Math.round(onboarded * faker.number.float({ min: 0.5, max: 0.9 }));

  return {
    term,
    eventsHeld: faker.number.int({ min: 3, max: 10 }),
    signUps,
    onboarded,
    activeMembers
  };
};

export const recruitmentCycleCreateInput = (
  executiveSummaryId: string,
  planned: PlannedRecruitmentCycle
): Prisma.Recruitment_CycleCreateInput => ({
  executiveSummary: { connect: { executiveSummaryId } },
  term: planned.term,
  eventsHeld: planned.eventsHeld,
  signUps: planned.signUps,
  onboarded: planned.onboarded,
  activeMembers: planned.activeMembers
});
