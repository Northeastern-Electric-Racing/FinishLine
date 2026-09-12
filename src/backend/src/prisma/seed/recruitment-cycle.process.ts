import { Recruitment_Cycle } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { ExecutiveSummaryOutput, ExecutiveSummaryProcess } from './executive-summary.process.js';
import {
  ALL_TERMS,
  planRecruitmentCycle,
  RECRUITMENT_CYCLE_CHANCE,
  recruitmentCycleCreateInput
} from '../factories/recruitment-cycle.factory.js';

export type RecruitmentCycleOutput = {
  recruitmentCycles: Recruitment_Cycle[];
};

export class RecruitmentCycleProcess extends SeedProcess<ExecutiveSummaryOutput, RecruitmentCycleOutput> {
  dependencies() {
    return [ExecutiveSummaryProcess];
  }

  async run({ executiveSummaries }: ExecutiveSummaryOutput): Promise<RecruitmentCycleOutput> {
    const planned = executiveSummaries.flatMap((executiveSummary) =>
      ALL_TERMS.filter(() => this.faker.datatype.boolean({ probability: RECRUITMENT_CYCLE_CHANCE })).map((term) => ({
        executiveSummaryId: executiveSummary.executiveSummaryId,
        planned: planRecruitmentCycle(this.faker, term)
      }))
    );

    const recruitmentCycles = await Promise.all(
      planned.map((p) =>
        this.prisma.recruitment_Cycle.create({
          data: recruitmentCycleCreateInput(p.executiveSummaryId, p.planned)
        })
      )
    );

    return { recruitmentCycles };
  }
}
