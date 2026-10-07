import { Faker } from '@faker-js/faker';
import { Competition, Prisma } from '@prisma/client';

// Chance a given executive summary has a recorded performance for a given competition -
// partial coverage, since not every season's team competes in (or has data for) both.
export const COMPETITION_PERFORMANCE_CHANCE = 0.75;

export const STATIC_EVENT_FIXTURES = ['Cost Report', 'Design Event', 'Business Presentation'];
export const DYNAMIC_EVENT_FIXTURES = ['Acceleration', 'Skidpad', 'Autocross', 'Endurance'];

export const ALL_COMPETITIONS: Competition[] = [Competition.FSAE, Competition.FHE];

export type PlannedCompetitionPerformance = {
  competition: Competition;
  finalPlace: number;
  totalPointsEarned: number;
  bestStaticEvent: string;
  worstStaticEvent: string;
  bestDynamicEvent: string;
  worstDynamicEvent: string;
  accelerationTopTimeSeconds: number;
  autocrossTopTimeSeconds: number;
  enduranceLapsCompleted: number;
  enduranceAvgLapTimeSeconds: number;
};

export const planCompetitionPerformance = (faker: Faker, competition: Competition): PlannedCompetitionPerformance => {
  const [bestStaticEvent, worstStaticEvent] = faker.helpers.shuffle([...STATIC_EVENT_FIXTURES]);
  const [bestDynamicEvent, worstDynamicEvent] = faker.helpers.shuffle([...DYNAMIC_EVENT_FIXTURES]);

  return {
    competition,
    finalPlace: faker.number.int({ min: 1, max: 100 }),
    totalPointsEarned: faker.number.int({ min: 0, max: 1000 }),
    bestStaticEvent,
    worstStaticEvent,
    bestDynamicEvent,
    worstDynamicEvent,
    accelerationTopTimeSeconds: faker.number.int({ min: 4, max: 8 }),
    autocrossTopTimeSeconds: faker.number.int({ min: 45, max: 70 }),
    enduranceLapsCompleted: faker.number.int({ min: 0, max: 22 }),
    enduranceAvgLapTimeSeconds: faker.number.int({ min: 60, max: 100 })
  };
};

export const competitionPerformanceCreateInput = (
  executiveSummaryId: string,
  planned: PlannedCompetitionPerformance
): Prisma.Competition_PerformanceCreateInput => ({
  executiveSummary: { connect: { executiveSummaryId } },
  competition: planned.competition,
  finalPlace: planned.finalPlace,
  totalPointsEarned: planned.totalPointsEarned,
  bestStaticEvent: planned.bestStaticEvent,
  worstStaticEvent: planned.worstStaticEvent,
  bestDynamicEvent: planned.bestDynamicEvent,
  worstDynamicEvent: planned.worstDynamicEvent,
  accelerationTopTimeSeconds: planned.accelerationTopTimeSeconds,
  autocrossTopTimeSeconds: planned.autocrossTopTimeSeconds,
  enduranceLapsCompleted: planned.enduranceLapsCompleted,
  enduranceAvgLapTimeSeconds: planned.enduranceAvgLapTimeSeconds
});
