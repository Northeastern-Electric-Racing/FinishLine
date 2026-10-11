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
 * Flat bump by change request type. Standard and Budget change requests wait for an
 * independent reviewer, so they are more time critical than the self-approving types.
 */
const CR_TYPE_WEIGHTS: Record<CR_Type, number> = {
  STANDARD: 10,
  BUDGET: 8,
  ACTIVATION: 4,
  STAGE_GATE: 4,
  LEADERSHIP: 0
};

/**
 * Multiplier on the log of the proposed budget in dollars. Budgets range from tens to
 * tens of thousands of dollars, so a linear weight would let a large budget drown out
 * every other factor. Log scaling means each 10x increase adds a fixed amount:
 * $1k adds 6, $10k adds 8, $100k adds 10.
 */
const BUDGET_MAGNITUDE_WEIGHT = 2;

export interface TriageScoreInput {
  /** the type of the change request */
  type: CR_Type;
  /** the proposed budget in cents, only set on budget change requests */
  proposedBudget?: number;
  /** how many work packages the change request's work package blocks */
  blockingCount: number;
  /** how many days the timeline is moving; positive is later, negative is earlier */
  timelineChangeInDays: number;
}

/**
 * Computes how urgent a change request is to review. Higher is more urgent.
 * Pure math with no database access so it can be tested in isolation.
 *
 * @param input the change request's scoring inputs
 * @returns the triage score
 */
export const computeTriageScore = (input: TriageScoreInput): number => {
  const { type, proposedBudget, blockingCount, timelineChangeInDays } = input;

  const typeScore = CR_TYPE_WEIGHTS[type];

  const blockingScore = blockingCount * BLOCKING_COUNT_WEIGHT;

  const timelineScore =
    timelineChangeInDays >= 0
      ? timelineChangeInDays * TIMELINE_PUSHED_LATER_WEIGHT
      : Math.abs(timelineChangeInDays) * TIMELINE_PULLED_EARLIER_WEIGHT;

  // budget is stored in cents, and log10 of zero or less is not a number
  const budgetInDollars = (proposedBudget ?? 0) / 100;
  const budgetScore = budgetInDollars > 1 ? BUDGET_MAGNITUDE_WEIGHT * Math.log10(budgetInDollars) : 0;

  return typeScore + blockingScore + timelineScore + budgetScore;
};
