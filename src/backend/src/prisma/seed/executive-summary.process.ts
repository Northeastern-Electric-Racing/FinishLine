import { Executive_Summary } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { CarProcess } from './car.process.js';
import { CarOutput, FullUser } from '../context.js';
import {
  EXECUTIVE_SUMMARY_DELETED_CHANCE,
  executiveSummaryCreateInput,
  generateNotes
} from '../factories/executive-summary.factory.js';

type ExecutiveSummaryInput = UsersOutput & CarOutput;

export type ExecutiveSummaryOutput = {
  executiveSummaries: Executive_Summary[];
};

export class ExecutiveSummaryProcess extends SeedProcess<ExecutiveSummaryInput, ExecutiveSummaryOutput> {
  dependencies() {
    return [UsersProcess, CarProcess];
  }

  async run({ admins, heads, leadership, cars }: ExecutiveSummaryInput): Promise<ExecutiveSummaryOutput> {
    const now = new Date();

    const leadershipPool: FullUser[] = [...admins, ...heads, ...leadership];
    if (leadershipPool.length === 0) {
      throw new Error('ExecutiveSummaryProcess requires at least one leadership-level user.');
    }

    // Each car represents one season, so every car gets exactly one executive summary.
    const planned = cars.map(({ car, dateRange }) => {
      const seasonStartDate = dateRange.start;
      const seasonEndDate = dateRange.end;
      // A season only gets its write-up once it has ended - if it hasn't (the newest, ongoing
      // season), the summary is dated "now" rather than a future date past the report itself.
      const dateCreated =
        seasonEndDate.getTime() <= now.getTime() ? this.faker.date.between({ from: seasonEndDate, to: now }) : now;

      const isDeleted = this.faker.datatype.boolean({ probability: EXECUTIVE_SUMMARY_DELETED_CHANCE });

      return {
        carId: car.carId,
        seasonStartDate,
        seasonEndDate,
        dateCreated,
        userCreatedId: this.faker.helpers.arrayElement(leadershipPool).userId,
        notes: {
          goals: generateNotes(this.faker),
          winsAndImprovements: generateNotes(this.faker),
          budgetNotes: generateNotes(this.faker),
          recruitmentNotes: generateNotes(this.faker)
        },
        // A soft-deleted row's dateDeleted must fall between its own creation and now.
        deleted: isDeleted
          ? {
              dateDeleted: this.faker.date.between({ from: dateCreated, to: now }),
              deletedByUserId: this.faker.helpers.arrayElement(leadershipPool).userId
            }
          : undefined
      };
    });

    const executiveSummaries = await Promise.all(
      planned.map((p) =>
        this.prisma.executive_Summary.create({
          data: executiveSummaryCreateInput(
            p.carId,
            p.seasonStartDate,
            p.seasonEndDate,
            p.notes,
            p.userCreatedId,
            p.dateCreated,
            p.deleted
          )
        })
      )
    );

    return { executiveSummaries };
  }
}
