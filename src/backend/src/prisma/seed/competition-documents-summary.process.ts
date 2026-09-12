import { Competition_Documents_Summary } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { ExecutiveSummaryOutput, ExecutiveSummaryProcess } from './executive-summary.process.js';
import {
  competitionDocumentsSummaryCreateInput,
  DOCUMENTS_SUMMARY_CHANCE,
  planCompetitionDocumentsSummary
} from '../factories/competition-documents-summary.factory.js';

export type CompetitionDocumentsSummaryOutput = {
  competitionDocumentsSummaries: Competition_Documents_Summary[];
};

export class CompetitionDocumentsSummaryProcess extends SeedProcess<
  ExecutiveSummaryOutput,
  CompetitionDocumentsSummaryOutput
> {
  dependencies() {
    return [ExecutiveSummaryProcess];
  }

  async run({ executiveSummaries }: ExecutiveSummaryOutput): Promise<CompetitionDocumentsSummaryOutput> {
    const now = new Date();

    const planned = executiveSummaries
      .filter(() => this.faker.datatype.boolean({ probability: DOCUMENTS_SUMMARY_CHANCE }))
      .map((executiveSummary) => ({
        executiveSummaryId: executiveSummary.executiveSummaryId,
        // A sync can only have happened between the summary's own creation and now.
        planned: planCompetitionDocumentsSummary(this.faker, { from: executiveSummary.dateCreated, to: now })
      }));

    const competitionDocumentsSummaries = await Promise.all(
      planned.map((p) =>
        this.prisma.competition_Documents_Summary.create({
          data: competitionDocumentsSummaryCreateInput(p.executiveSummaryId, p.planned)
        })
      )
    );

    return { competitionDocumentsSummaries };
  }
}
