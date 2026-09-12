import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { seedConfig } from '../seed-config.js';

export const EXECUTIVE_SUMMARY_COUNT = seedConfig.executiveSummary.executiveSummaryCount;

// Executive summaries are official leadership-level records, so soft-deletes are rare.
export const EXECUTIVE_SUMMARY_DELETED_CHANCE = 0.05;

// Season i starts Aug 1 of (CURRENT_YEAR - (EXECUTIVE_SUMMARY_COUNT - 1) + i) and ends the
// following May 31, so the most recent season is the current (possibly still-ongoing) one -
// mirrors car.factory.ts's carYear spread.
export const seasonNameForIndex = (index: number): string => {
  const startYear = new Date().getFullYear() - (EXECUTIVE_SUMMARY_COUNT - 1) + index;
  return `${startYear}-${startYear + 1}`;
};

export const seasonDateRangeForIndex = (index: number): { seasonStartDate: Date; seasonEndDate: Date } => {
  const startYear = new Date().getFullYear() - (EXECUTIVE_SUMMARY_COUNT - 1) + index;
  return {
    seasonStartDate: new Date(Date.UTC(startYear, 7, 1)), // Aug 1
    seasonEndDate: new Date(Date.UTC(startYear + 1, 4, 31)) // May 31
  };
};

export const generateNotes = (faker: Faker): string => faker.lorem.paragraph();

export const executiveSummaryCreateInput = (
  organizationId: string,
  seasonName: string,
  seasonStartDate: Date,
  seasonEndDate: Date,
  notes: { goals: string; winsAndImprovements: string; budgetNotes: string; recruitmentNotes: string },
  userCreatedId: string,
  dateCreated: Date,
  deleted: { dateDeleted: Date; deletedByUserId: string } | undefined
): Prisma.Executive_SummaryCreateInput => ({
  seasonName,
  seasonStartDate,
  seasonEndDate,
  goals: notes.goals,
  winsAndImprovements: notes.winsAndImprovements,
  budgetNotes: notes.budgetNotes,
  recruitmentNotes: notes.recruitmentNotes,
  dateCreated,
  organization: { connect: { organizationId } },
  userCreated: { connect: { userId: userCreatedId } },
  ...(deleted ? { dateDeleted: deleted.dateDeleted, deletedBy: { connect: { userId: deleted.deletedByUserId } } } : {})
});
