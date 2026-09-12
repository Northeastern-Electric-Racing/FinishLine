import { Executive_Summary } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { FullUser } from '../context.js';
import {
  EXECUTIVE_SUMMARY_COUNT,
  EXECUTIVE_SUMMARY_DELETED_CHANCE,
  executiveSummaryCreateInput,
  generateNotes,
  seasonDateRangeForIndex,
  seasonNameForIndex
} from '../factories/executive-summary.factory.js';

type ExecutiveSummaryInput = OrganizationOutput & UsersOutput;

export type ExecutiveSummaryOutput = {
  executiveSummaries: Executive_Summary[];
};

export class ExecutiveSummaryProcess extends SeedProcess<ExecutiveSummaryInput, ExecutiveSummaryOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess];
  }

  async run({ organization, admins, heads, leadership }: ExecutiveSummaryInput): Promise<ExecutiveSummaryOutput> {
    const { organizationId } = organization;
    const now = new Date();

    const leadershipPool: FullUser[] = [...admins, ...heads, ...leadership];
    if (leadershipPool.length === 0) {
      throw new Error('ExecutiveSummaryProcess requires at least one leadership-level user.');
    }

    const planned = Array.from({ length: EXECUTIVE_SUMMARY_COUNT }, (_, index) => {
      const { seasonStartDate, seasonEndDate } = seasonDateRangeForIndex(index);
      // A season only gets its write-up once it has ended - if it hasn't (the newest, ongoing
      // season), the summary is dated "now" rather than a future date past the report itself.
      const dateCreated =
        seasonEndDate.getTime() <= now.getTime() ? this.faker.date.between({ from: seasonEndDate, to: now }) : now;

      const isDeleted = this.faker.datatype.boolean({ probability: EXECUTIVE_SUMMARY_DELETED_CHANCE });

      return {
        seasonName: seasonNameForIndex(index),
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
            organizationId,
            p.seasonName,
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
