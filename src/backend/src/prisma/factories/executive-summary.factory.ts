import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

// Executive summaries are official leadership-level records, so soft-deletes are rare.
export const EXECUTIVE_SUMMARY_DELETED_CHANCE = 0.05;

export const generateNotes = (faker: Faker): string => faker.lorem.paragraph();

export const executiveSummaryCreateInput = (
  organizationId: string,
  carId: string,
  seasonStartDate: Date,
  seasonEndDate: Date,
  notes: { goals: string; winsAndImprovements: string; budgetNotes: string; recruitmentNotes: string },
  userCreatedId: string,
  dateCreated: Date,
  deleted: { dateDeleted: Date; deletedByUserId: string } | undefined
): Prisma.Executive_SummaryCreateInput => ({
  car: { connect: { carId } },
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
