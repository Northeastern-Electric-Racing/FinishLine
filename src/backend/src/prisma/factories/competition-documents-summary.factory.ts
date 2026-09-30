import { Faker } from '@faker-js/faker';
import { Data_Source, Prisma } from '@prisma/client';

// Chance a given executive summary has a documents summary at all - optional 1:1, so partial
// coverage rather than every season.
export const DOCUMENTS_SUMMARY_CHANCE = 0.6;

// Chance the documents summary was synced automatically vs entered by hand.
export const AUTO_SOURCE_CHANCE = 0.4;

// Chance a given count is missing entirely - older, backfilled seasons don't always have
// complete records.
export const COUNT_MISSING_CHANCE = 0.2;

export type PlannedCompetitionDocumentsSummary = {
  submittedOnTimeCount: number | undefined;
  firstSubmissionRejectedCount: number | undefined;
  source: Data_Source;
  dateSynced: Date | undefined;
};

export const planCompetitionDocumentsSummary = (
  faker: Faker,
  dateRange: { from: Date; to: Date }
): PlannedCompetitionDocumentsSummary => {
  const isAuto = faker.datatype.boolean({ probability: AUTO_SOURCE_CHANCE });
  return {
    submittedOnTimeCount: faker.datatype.boolean({ probability: COUNT_MISSING_CHANCE })
      ? undefined
      : faker.number.int({ min: 0, max: 20 }),
    firstSubmissionRejectedCount: faker.datatype.boolean({ probability: COUNT_MISSING_CHANCE })
      ? undefined
      : faker.number.int({ min: 0, max: 10 }),
    source: isAuto ? Data_Source.AUTO : Data_Source.MANUAL,
    // Only an AUTO source has ever actually run a sync.
    dateSynced: isAuto ? faker.date.between(dateRange) : undefined
  };
};

export const competitionDocumentsSummaryCreateInput = (
  executiveSummaryId: string,
  planned: PlannedCompetitionDocumentsSummary
): Prisma.Competition_Documents_SummaryCreateInput => ({
  executiveSummary: { connect: { executiveSummaryId } },
  submittedOnTimeCount: planned.submittedOnTimeCount ?? null,
  firstSubmissionRejectedCount: planned.firstSubmissionRejectedCount ?? null,
  source: planned.source,
  dateSynced: planned.dateSynced ?? null
});
