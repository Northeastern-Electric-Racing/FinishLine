/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type } from '@prisma/client';
import { computeTriageScore, TriageScoreInput } from '../../src/utils/triage-score.utils.js';

const baseInput: TriageScoreInput = {
  type: CR_Type.STANDARD,
  blockingCount: 0,
  timelineChangeInDays: 0
};

describe('computeTriageScore', () => {
  describe('change request type', () => {
    it('scores a standard change request highest', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.STANDARD })).toBe(10);
    });

    it('scores a budget change request below standard', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.BUDGET })).toBe(8);
    });

    it('scores activation and stage gate the same', () => {
      const activation = computeTriageScore({ ...baseInput, type: CR_Type.ACTIVATION });
      const stageGate = computeTriageScore({ ...baseInput, type: CR_Type.STAGE_GATE });

      expect(activation).toBe(4);
      expect(stageGate).toBe(4);
    });

    it('gives leadership change requests no bump', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP })).toBe(0);
    });
  });

  describe('blocking count', () => {
    it('adds nothing when the work package blocks nothing', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP, blockingCount: 0 })).toBe(0);
    });

    it('adds two points per blocked work package', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP, blockingCount: 3 })).toBe(6);
    });

    it('scores a work package blocking more others higher', () => {
      const blocksOne = computeTriageScore({ ...baseInput, blockingCount: 1 });
      const blocksFive = computeTriageScore({ ...baseInput, blockingCount: 5 });

      expect(blocksFive).toBeGreaterThan(blocksOne);
    });
  });

  describe('timeline change', () => {
    it('adds 1.5 points per day when pushing the timeline later', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP, timelineChangeInDays: 10 })).toBe(15);
    });

    it('adds 0.5 points per day when pulling the timeline earlier', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP, timelineChangeInDays: -10 })).toBe(5);
    });

    it('scores pushing later higher than pulling earlier by the same amount', () => {
      const pushedLater = computeTriageScore({ ...baseInput, timelineChangeInDays: 7 });
      const pulledEarlier = computeTriageScore({ ...baseInput, timelineChangeInDays: -7 });

      expect(pushedLater).toBeGreaterThan(pulledEarlier);
    });

    it('adds nothing when the timeline is unchanged', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP, timelineChangeInDays: 0 })).toBe(0);
    });
  });

  describe('budget change magnitude', () => {
    it('adds nothing when no budget change is given', () => {
      expect(computeTriageScore({ ...baseInput, type: CR_Type.LEADERSHIP })).toBe(0);
    });

    it('adds nothing when the budget is unchanged', () => {
      expect(
        computeTriageScore({
          ...baseInput,
          type: CR_Type.LEADERSHIP,
          budgetChange: { proposed: 5000000, current: 5000000 }
        })
      ).toBe(0);
    });

    it('scores the size of the change, not the new total', () => {
      // a $1k change on a $50k budget vs the same $1k change on a $2k budget
      const changeOnLargeBudget = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 5100000, current: 5000000 }
      });
      const changeOnSmallBudget = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 300000, current: 200000 }
      });

      expect(changeOnLargeBudget).toBeCloseTo(changeOnSmallBudget);
    });

    it('scores a large budget change above a small one', () => {
      const smallChange = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 1100000, current: 1000000 }
      });
      const largeChange = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 3000000, current: 1000000 }
      });

      expect(largeChange).toBeGreaterThan(smallChange);
    });

    it('scores a budget decrease the same as an equal increase', () => {
      const increase = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 2000000, current: 1000000 }
      });
      const decrease = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 1000000, current: 2000000 }
      });

      expect(increase).toBeCloseTo(decrease);
    });

    it('scales logarithmically so each 10x increase in the change adds the same amount', () => {
      // budgets are in cents, so these are changes of $1k, $10k and $100k from a zero budget
      const thousand = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 100000, current: 0 }
      });
      const tenThousand = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 1000000, current: 0 }
      });
      const hundredThousand = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 10000000, current: 0 }
      });

      expect(thousand).toBeCloseTo(6);
      expect(tenThousand).toBeCloseTo(8);
      expect(hundredThousand).toBeCloseTo(10);
    });

    it('does not let a large budget change dominate the other factors', () => {
      const hugeChange = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        budgetChange: { proposed: 10000000, current: 0 }
      });
      const blocksSixWorkPackages = computeTriageScore({
        ...baseInput,
        type: CR_Type.LEADERSHIP,
        blockingCount: 6
      });

      expect(hugeChange).toBeLessThan(blocksSixWorkPackages * 2);
    });
  });

  describe('combined scoring', () => {
    it('sums every factor', () => {
      // standard (10) + 3 blocked (6) + 10 days later (15) = 31
      const score = computeTriageScore({
        type: CR_Type.STANDARD,
        blockingCount: 3,
        timelineChangeInDays: 10
      });

      expect(score).toBe(31);
    });

    it('scores a disruptive change request above a minor one', () => {
      const disruptive = computeTriageScore({
        type: CR_Type.STANDARD,
        blockingCount: 4,
        timelineChangeInDays: 21
      });
      const minor = computeTriageScore({
        type: CR_Type.ACTIVATION,
        blockingCount: 0,
        timelineChangeInDays: -2
      });

      expect(disruptive).toBeGreaterThan(minor);
    });
  });
});
