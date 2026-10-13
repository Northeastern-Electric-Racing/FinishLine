/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type } from '@prisma/client';

/**
 * Each work package blocked by this one adds this much to the score.
 * Weighted highest because a blocked work package is a delay that is already happening.
 */
const BLOCKING_COUNT_WEIGHT = 2;

/**
 * Each day the timeline is being pushed later adds this much.
 * Pushing a deadline out is the clearest signal of an unanticipated change.
 */
const TIMELINE_PUSHED_LATER_WEIGHT = 1.5;

/**
 * Each day the timeline is being pulled earlier adds this much.
 * Lower than pushing later because finishing sooner is less disruptive.
 */
const TIMELINE_PULLED_EARLIER_WEIGHT = 0.5;

/**
 * Flat bump by change request type. Standard and Budget change requests go through
 * independent review, so they represent more deliberate, higher-impact changes than
 * the self-approving types.
 */
const CR_TYPE_WEIGHTS: Record<CR_Type, number> = {
  STANDARD: 10,
  BUDGET: 8,
  ACTIVATION: 4,
  STAGE_GATE: 4,
  LEADERSHIP: 0
};

/**
 * Multiplier on the log of the budget change in dollars. Budget changes range from tens
 * to tens of thousands of dollars, so a linear weight would let a large change drown out
 * every other factor. Log scaling means each 10x increase adds a fixed amount:
 * a $1k change adds 6, $10k adds 8, $100k adds 10.
 */
const BUDGET_MAGNITUDE_WEIGHT = 2;

export interface TriageScoreInput {
  type: CR_Type;
  /** the proposed new budget in cents, only set on budget change requests */
  proposedBudget?: number;
  /** the current budget in cents, only set on budget change requests */
  currentBudget?: number;
  blockingCount: number;
  timelineChangeInDays: number;
}

/**
 * Computes how significant a change request's impact is. Higher means a larger,
 * less anticipated change.
 *
 * @param input the change request's scoring inputs
 * @returns the triage score
 */
export const computeTriageScore = (input: TriageScoreInput): number => {
  const { type, proposedBudget, currentBudget, blockingCount, timelineChangeInDays } = input;

  const typeScore = CR_TYPE_WEIGHTS[type];

  const blockingScore = blockingCount * BLOCKING_COUNT_WEIGHT;

  const timelineScore =
    timelineChangeInDays >= 0
      ? timelineChangeInDays * TIMELINE_PUSHED_LATER_WEIGHT
      : Math.abs(timelineChangeInDays) * TIMELINE_PULLED_EARLIER_WEIGHT;

  // budget is stored in cents, and the size of the change matters rather than the new total
  const budgetChangeInDollars = Math.abs((proposedBudget ?? 0) - (currentBudget ?? 0)) / 100;
  const budgetScore = budgetChangeInDollars > 1 ? BUDGET_MAGNITUDE_WEIGHT * Math.log10(budgetChangeInDollars) : 0;

  return typeScore + blockingScore + timelineScore + budgetScore;
};
