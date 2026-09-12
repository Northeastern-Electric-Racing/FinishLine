import { Faker } from '@faker-js/faker';
import { Data_Source, Prisma } from '@prisma/client';

// Chance a given executive summary has a documents summary at all - optional 1:1, so partial
// coverage rather than every season.
export const DOCUMENTS_SUMMARY_CHANCE = 0.6;

// Chance the documents summary was synced automatically vs entered by hand.
export const AUTO_SOURCE_CHANCE = 0.4;

export type PlannedCompetitionDocumentsSummary = {
  submittedOnTimeCount: number;
  firstSubmissionRejectedCount: number;
  source: Data_Source;
  dateSynced: Date | undefined;
};

export const planCompetitionDocumentsSummary = (
  faker: Faker,
  dateRange: { from: Date; to: Date }
): PlannedCompetitionDocumentsSummary => {
  const isAuto = faker.datatype.boolean({ probability: AUTO_SOURCE_CHANCE });
  return {
    submittedOnTimeCount: faker.number.int({ min: 0, max: 20 }),
    firstSubmissionRejectedCount: faker.number.int({ min: 0, max: 10 }),
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
  submittedOnTimeCount: planned.submittedOnTimeCount,
  firstSubmissionRejectedCount: planned.firstSubmissionRejectedCount,
  source: planned.source,
  dateSynced: planned.dateSynced ?? null
});
