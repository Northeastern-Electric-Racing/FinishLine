/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { VehicleDevelopmentProjectSummary } from 'shared';
import {
  buildRecruitmentYoyMetrics,
  getDaysAxisTicks,
  getElapsedDays,
  NewMemberJourneyPoint,
  termLabelShort,
  termLabelSortKey
} from '../../utils/exec-summary.utils';

const project = (startDate: Date, plannedEndDate: Date): VehicleDevelopmentProjectSummary => ({
  wbsElementId: 'id',
  name: 'project',
  teams: [],
  startDate,
  plannedEndDate
});

describe('getElapsedDays', () => {
  const p = project(new Date(2026, 0, 6), new Date(2026, 1, 5));

  it('is the days since the start when today is inside the project', () => {
    expect(getElapsedDays(p, new Date(2026, 0, 16))).toBe(10);
  });

  it('clamps to 0 before the start and to the bar length after the end', () => {
    expect(getElapsedDays(p, new Date(2025, 11, 1))).toBe(0);
    expect(getElapsedDays(p, new Date(2026, 5, 1))).toBe(30);
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

describe('term label helpers', () => {
  it('sorts spring before fall within a year', () => {
    const labels = ['Fall 2024', 'Spring 2024', 'Fall 2023', 'Spring 2025'];
    expect([...labels].sort((a, b) => termLabelSortKey(a) - termLabelSortKey(b))).toEqual([
      'Fall 2023',
      'Spring 2024',
      'Fall 2024',
      'Spring 2025'
    ]);
  });

  it('shortens labels', () => {
    expect(termLabelShort('Fall 2023')).toBe('F23');
    expect(termLabelShort('Spring 2026')).toBe('S26');
  });
});

describe('buildRecruitmentYoyMetrics', () => {
  const journey = (label: string, signUps: number, onboarded: number, newActiveMembers: number): NewMemberJourneyPoint => ({
    label,
    sortKey: termLabelSortKey(label),
    signUps,
    onboarded,
    newActiveMembers
  });
  const journeyPoints = [
    journey('Fall 2023', 300, 220, 170),
    journey('Spring 2024', 180, 90, 50),
    journey('Fall 2024', 240, 140, 100),
    journey('Spring 2025', 260, 170, 130),
    journey('Fall 2025', 300, 220, 180)
  ];
  const activeTotals = [
    { label: 'Fall 2023', total: 400 },
    { label: 'Spring 2024', total: 200 },
    { label: 'Fall 2024', total: 300 },
    { label: 'Spring 2025', total: 320 },
    { label: 'Fall 2025', total: 330 }
  ];
  const allLabels = journeyPoints.map((p) => p.label);

  it('finds best/worst seasons and averages within the selected terms', () => {
    const metrics = buildRecruitmentYoyMetrics(journeyPoints, activeTotals, allLabels);
    expect(metrics.bestByNewActiveMembers).toBe('Fall 2025');
    expect(metrics.bestByOnboarded).toBe('Fall 2023');
    expect(metrics.worstByNewActiveMembers).toBe('Spring 2024');
    expect(metrics.worstByOnboarded).toBe('Spring 2024');
    expect(metrics.averageNewActiveMembers).toBe(126);
    expect(metrics.averageActiveMembers).toBe(310);
  });

  it('compares the newest selected term to the same term a year earlier', () => {
    const metrics = buildRecruitmentYoyMetrics(journeyPoints, activeTotals, allLabels);
    expect(metrics.recruitmentGrowth).toBe(25); // 240 -> 300
    expect(metrics.newActiveMemberGrowth).toBe(80); // 100 -> 180
    expect(metrics.activeMemberGrowth).toBe(10); // 300 -> 330
  });

  it('looks up the prior year outside the selected window', () => {
    const metrics = buildRecruitmentYoyMetrics(journeyPoints, activeTotals, ['Spring 2025', 'Fall 2025']);
    expect(metrics.recruitmentGrowth).toBe(25);
    expect(metrics.bestByOnboarded).toBe('Fall 2025');
  });

  it('leaves metrics undefined when there is no data to compare', () => {
    const metrics = buildRecruitmentYoyMetrics(journeyPoints.slice(0, 1), activeTotals.slice(0, 1), ['Fall 2023']);
    expect(metrics.recruitmentGrowth).toBeUndefined();
    expect(buildRecruitmentYoyMetrics([], [], []).bestByOnboarded).toBeUndefined();
  });
});
