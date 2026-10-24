/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { VehicleDevelopmentProjectSummary } from 'shared';
import { getBarLengthInDays, getDaysAxisTicks, getElapsedDays } from '../../utils/exec-summary.utils';

const project = (startDate: Date, plannedEndDate: Date): VehicleDevelopmentProjectSummary => ({
  wbsElementId: 'id',
  name: 'project',
  teams: [],
  startDate,
  plannedEndDate
});

describe('getBarLengthInDays', () => {
  it('counts days between dates', () => {
    expect(getBarLengthInDays(new Date('2026-01-01'), new Date('2026-01-31'))).toBe(30);
  });

  it('is 0 for same day and for an end before the start', () => {
    expect(getBarLengthInDays(new Date('2026-01-01'), new Date('2026-01-01'))).toBe(0);
    expect(getBarLengthInDays(new Date('2026-02-01'), new Date('2026-01-01'))).toBe(0);
  });
});

describe('getElapsedDays', () => {
  const p = project(new Date('2026-01-06'), new Date('2026-02-05'));

  it('is the days since the start when today is inside the project', () => {
    expect(getElapsedDays(p, new Date('2026-01-16'))).toBe(10);
  });

  it('clamps to 0 before the start and to the bar length after the end', () => {
    expect(getElapsedDays(p, new Date('2025-12-01'))).toBe(0);
    expect(getElapsedDays(p, new Date('2026-06-01'))).toBe(30);
  });
});

describe('getDaysAxisTicks', () => {
  it('covers the total with round steps', () => {
    expect(getDaysAxisTicks(30)).toEqual([0, 5, 10, 15, 20, 25, 30]);
    expect(getDaysAxisTicks(75)).toEqual([0, 15, 30, 45, 60, 75]);
  });

  it('extends past the total when it is not a multiple of the step', () => {
    const ticks = getDaysAxisTicks(33);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(33);
  });

  it('handles zero days', () => {
    expect(getDaysAxisTicks(0)).toEqual([0]);
  });

  it('keeps tick count small for long spans', () => {
    expect(getDaysAxisTicks(400).length).toBeLessThanOrEqual(8);
  });
});
