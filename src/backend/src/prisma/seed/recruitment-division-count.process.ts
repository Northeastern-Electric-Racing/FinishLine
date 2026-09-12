import { Recruitment_Division_Count } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { RecruitmentCycleOutput, RecruitmentCycleProcess } from './recruitment-cycle.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import {
  recruitmentDivisionCountCreateInput,
  returningMembersForDivision,
  splitIntoParts
} from '../factories/recruitment-division-count.factory.js';

type RecruitmentDivisionCountInput = RecruitmentCycleOutput & ConfigDataOutput;

export type RecruitmentDivisionCountOutput = {
  recruitmentDivisionCounts: Recruitment_Division_Count[];
};

export class RecruitmentDivisionCountProcess extends SeedProcess<
  RecruitmentDivisionCountInput,
  RecruitmentDivisionCountOutput
> {
  dependencies() {
    return [RecruitmentCycleProcess, ConfigDataProcess];
  }

  async run({ recruitmentCycles, teamTypes }: RecruitmentDivisionCountInput): Promise<RecruitmentDivisionCountOutput> {
    if (teamTypes.length === 0) {
      throw new Error('RecruitmentDivisionCountProcess requires at least one team type.');
    }

    const planned = recruitmentCycles.flatMap((cycle) => {
      // New members are split across every division so they sum back to the cycle's own
      // onboarded count, rather than each division inventing an unrelated number.
      const newMemberShares = splitIntoParts(this.faker, cycle.onboarded, teamTypes.length);
      return teamTypes.map((teamType, i) => ({
        recruitmentCycleId: cycle.recruitmentCycleId,
        teamTypeId: teamType.teamTypeId,
        newMembers: newMemberShares[i],
        returningMembers: returningMembersForDivision(this.faker)
      }));
    });

    const recruitmentDivisionCounts = await Promise.all(
      planned.map((p) =>
        this.prisma.recruitment_Division_Count.create({
          data: recruitmentDivisionCountCreateInput(p.recruitmentCycleId, p.teamTypeId, p.newMembers, p.returningMembers)
        })
      )
    );

    return { recruitmentDivisionCounts };
  }
}
