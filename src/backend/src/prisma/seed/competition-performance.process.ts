import { Competition_Performance } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { ExecutiveSummaryOutput, ExecutiveSummaryProcess } from './executive-summary.process.js';
import {
  ALL_COMPETITIONS,
  COMPETITION_PERFORMANCE_CHANCE,
  competitionPerformanceCreateInput,
  planCompetitionPerformance
} from '../factories/competition-performance.factory.js';

export type CompetitionPerformanceOutput = {
  competitionPerformances: Competition_Performance[];
};

export class CompetitionPerformanceProcess extends SeedProcess<ExecutiveSummaryOutput, CompetitionPerformanceOutput> {
  dependencies() {
    return [ExecutiveSummaryProcess];
  }

  async run({ executiveSummaries }: ExecutiveSummaryOutput): Promise<CompetitionPerformanceOutput> {
    const planned = executiveSummaries.flatMap((executiveSummary) =>
      ALL_COMPETITIONS.filter(() => this.faker.datatype.boolean({ probability: COMPETITION_PERFORMANCE_CHANCE })).map(
        (competition) => ({
          executiveSummaryId: executiveSummary.executiveSummaryId,
          planned: planCompetitionPerformance(this.faker, competition)
        })
      )
    );

    const competitionPerformances = await Promise.all(
      planned.map((p) =>
        this.prisma.competition_Performance.create({
          data: competitionPerformanceCreateInput(p.executiveSummaryId, p.planned)
        })
      )
    );

    return { competitionPerformances };
  }
}
