import { readFileSync } from 'fs';

export type WeightedValue<T> = { weight: number; value: T };
export type NumberRange = { min: number; max: number };
export type WeightedCount =
  | {
      weight: number;
      value: number;
    }
  | {
      weight: number;
      min: number;
      max: number;
    };

export type ReviewOutcome = 'APPROVED' | 'DENIED' | 'PENDING';

export interface SeedConfig {
  car: {
    carCount: number;
    seasonWindow: { fromMonth: number; fromDay: number; toMonth: number; toDay: number };
  };
  descriptionBullet: {
    countWeights: WeightedValue<number>[];
    suffixChance: number;
    maxDateAddedOffsetDays: number;
  };
  scheduling: {
    hoursPerDay: number;
    availabilityBlocks: {
      weekend: NumberRange;
      weekday: NumberRange;
    };
  };
  reimbursementRequest: {
    bomTieChance: {
      pastYear: number;
      currentYear: number;
    };
    bomProductRatio: number;
    productCountWeights: WeightedValue<number>[];
    deniedChance: number;
    stageDelayDays: NumberRange;
    fallbackMaterialCost: NumberRange;
    dateOfExpenseRecentDays: NumberRange;
    deliveryChance: number;
    deliveryOffsetDays: NumberRange;
    assigneeChance: number;
    extraCommentChance: number;
    reimbursementChancePerRecipient: number;
    reimbursementAmountMultiplier: NumberRange;
    pendingFinanceRecipientActorChance: number;
  };
  project: {
    projectsPerCar: number;
    teamCountWeights: WeightedValue<number>[];
    linkCountWeights: WeightedValue<number>[];
  };
  user: {
    totalUsers: number;
    roleDistribution: {
      guest: number;
      member: number;
      leadership: number;
      head: number;
    };
  };
  team: {
    leadsPerTeam: NumberRange;
    membersPerTeam: NumberRange;
  };
  workPackage: {
    countWeights: WeightedValue<number>[];
    nullStageChance: number;
    blockedChance: number;
    durationWeeks: NumberRange;
  };
}

export const seedConfig: SeedConfig = JSON.parse(
  readFileSync(new URL('./seed-config.json', import.meta.url), 'utf-8')
) as SeedConfig;
