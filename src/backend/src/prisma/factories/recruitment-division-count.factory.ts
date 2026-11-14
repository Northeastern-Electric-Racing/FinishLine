import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

// Splits `total` into `parts` non-negative integers that sum back to `total`, so a
// recruitment cycle's per-division new-member counts never overshoot its own onboarded count.
export const splitIntoParts = (faker: Faker, total: number, parts: number): number[] => {
  if (parts <= 0) return [];
  const weights = Array.from({ length: parts }, () => faker.number.float({ min: 0, max: 1 }));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map((w) => Math.floor((weightSum === 0 ? 1 / parts : w / weightSum) * total));
  // Floor rounding can leave a remainder - hand it to the first division rather than dropping it.
  const remainder = total - shares.reduce((a, b) => a + b, 0);
  shares[0] += remainder;
  return shares;
};

export const returningMembersForDivision = (faker: Faker): number => faker.number.int({ min: 0, max: 20 });

export const recruitmentDivisionCountCreateInput = (
  recruitmentCycleId: string,
  teamTypeId: string,
  newMembers: number,
  returningMembers: number
): Prisma.Recruitment_Division_CountCreateInput => ({
  recruitmentCycle: { connect: { recruitmentCycleId } },
  teamType: { connect: { teamTypeId } },
  newMembers,
  returningMembers
});
