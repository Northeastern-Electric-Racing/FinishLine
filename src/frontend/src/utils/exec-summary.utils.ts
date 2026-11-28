/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  daysBetween,
  dbDateToLocalDate,
  ExecutiveSummary,
  RecruitmentCycle,
  Term,
  VehicleDevelopmentProjectSummary
} from 'shared';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Computes how many days of a project have elapsed as of today, i.e. where the dotted "today" marker
 * sits on the project's bar. This is clamped to [0, bar length], so a project that hasn't started is at 0
 * and a finished one is at its full length.
 */
export const getElapsedDays = (project: VehicleDevelopmentProjectSummary, today: Date): number => {
  // startDate is local midnight (see dbDateToLocalDate in the transformer), so compare it against today at local midnight
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsed = Math.floor((todayLocal.getTime() - project.startDate.getTime()) / MS_PER_DAY);
  return Math.min(Math.max(0, daysBetween(project.plannedEndDate, project.startDate)), Math.max(0, elapsed));
};

/**
 * Computes the tick values for the days axis, from 0 up to (at least) the given number of days.
 * The step is chosen from a short list of round numbers so that there are at most ~6 intervals.
 *
 * @param totalDays the last day that has to be covered by the axis
 * @returns ascending tick values starting at 0 and ending at or after totalDays
 */
export const getDaysAxisTicks = (totalDays: number): number[] => {
  const steps = [1, 2, 5, 10, 15, 30, 60, 100, 200, 500, 1000];
  const step = steps.find((s) => totalDays / s <= 6) ?? 1000;
  const ticks: number[] = [];
  for (let day = 0; day < totalDays + step; day += step) {
    ticks.push(day);
    if (day >= totalDays) break;
  }
  return ticks;
};

export const EXEC_SUMMARY_BACKGROUND = '#121212';
export const BUDGET_CHART_COLORS = ['#ef4345', '#9B3425', '#5E1A10', '#B3B3B3', '#808080', '#5C5C5C', '#3D3D3D', '#2A2A2A'];

export const formatDollars = (amount: number): string => `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export interface NewMemberJourneyPoint {
  label: string;
  sortKey: number;
  signUps: number;
  onboarded: number;
  newActiveMembers: number;
}

/**
 * Builds the new member journey chart data, one point per term+year, summed across executive summaries.
 */
export const buildNewMemberJourneyData = (executiveSummaries: ExecutiveSummary[]): NewMemberJourneyPoint[] => {
  const pointsByLabel = new Map<string, NewMemberJourneyPoint>();

  executiveSummaries.forEach((executiveSummary) => {
    executiveSummary.recruitmentCycles.forEach((cycle: RecruitmentCycle) => {
      const seasonDate = cycle.term === Term.FALL ? executiveSummary.seasonStartDate : executiveSummary.seasonEndDate;
      if (!seasonDate) return;

      const year = dbDateToLocalDate(seasonDate).getFullYear();
      const termLabel = cycle.term === Term.FALL ? 'Fall' : 'Spring';
      const label = `${termLabel} ${year}`;

      // sortKey is anchored on seasonStartDate's year regardless of term, so Fall and its own
      // Spring always sort together - using seasonEndDate's year for Spring's sortKey would make
      // it collide with the NEXT season's Fall.
      if (!executiveSummary.seasonStartDate) return;
      const academicYearAnchor = new Date(executiveSummary.seasonStartDate).getFullYear();
      const sortKey = academicYearAnchor * 10 + (cycle.term === Term.FALL ? 0 : 1);

      const newActiveMembers = cycle.divisionCounts.reduce((sum, division) => sum + (division.newMembers ?? 0), 0);

      const existing = pointsByLabel.get(label);
      if (existing) {
        existing.signUps += cycle.signUps ?? 0;
        existing.onboarded += cycle.onboarded ?? 0;
        existing.newActiveMembers += newActiveMembers;
      } else {
        pointsByLabel.set(label, {
          label,
          sortKey,
          signUps: cycle.signUps ?? 0,
          onboarded: cycle.onboarded ?? 0,
          newActiveMembers
        });
      }
    });
  });

  return Array.from(pointsByLabel.values()).sort((a, b) => a.sortKey - b.sortKey);
};

/**
 * Orders term labels like "Fall 2023" / "Spring 2024" chronologically (spring before fall within a calendar year).
 */
export const termLabelSortKey = (label: string): number => {
  const [term, year] = label.split(' ');
  return Number(year) * 2 + (term === 'Fall' ? 1 : 0);
};

/** Shortens a term label like "Fall 2023" to "F23". */
export const termLabelShort = (label: string): string => {
  const [term, year] = label.split(' ');
  return `${term.charAt(0)}${year.slice(-2)}`;
};

/** The same term one year earlier, e.g. "Fall 2025" -> "Fall 2024". */
const previousYearTermLabel = (label: string): string => {
  const [term, year] = label.split(' ');
  return `${term} ${Number(year) - 1}`;
};

export interface TermTotal {
  label: string;
  total: number;
}

export interface RecruitmentYoyMetrics {
  bestByNewActiveMembers?: string;
  bestByOnboarded?: string;
  worstByNewActiveMembers?: string;
  worstByOnboarded?: string;
  averageNewActiveMembers?: number;
  averageActiveMembers?: number;
  // percentages; undefined when there is no same-term data from the year before
  recruitmentGrowth?: number;
  newActiveMemberGrowth?: number;
  activeMemberGrowth?: number;
}

const extremeLabel = <T extends { label: string }>(points: T[], value: (p: T) => number, best: boolean) =>
  points.reduce<T | undefined>((pick, point) => {
    if (!pick) return point;
    return (best ? value(point) > value(pick) : value(point) < value(pick)) ? point : pick;
  }, undefined)?.label;

const average = (values: number[]): number | undefined =>
  values.length === 0 ? undefined : Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

/**
 * Growth (as a percentage) of the newest term in `windowPoints` compared to the same term a year earlier.
 * The earlier term is looked up in `allPoints` so it still counts if it falls just outside the window.
 */
const yoyGrowth = <T extends { label: string }>(
  windowPoints: T[],
  allPoints: T[],
  value: (p: T) => number
): number | undefined => {
  const latest = windowPoints[windowPoints.length - 1];
  if (!latest) return undefined;
  const previous = allPoints.find((p) => p.label === previousYearTermLabel(latest.label));
  if (!previous || value(previous) === 0) return undefined;
  return Math.round(((value(latest) - value(previous)) / value(previous)) * 100);
};

/**
 * Computes the Key YoY Metrics for the recruitment & membership overlay.
 *
 * @param journeyPoints every term's sign-ups / onboarded / new active members, oldest first
 * @param activeMemberTotals every term's total active members (new + returning across divisions), oldest first
 * @param termLabels the terms currently selected; best/worst/averages only look at these
 */
export const buildRecruitmentYoyMetrics = (
  journeyPoints: NewMemberJourneyPoint[],
  activeMemberTotals: TermTotal[],
  termLabels: string[]
): RecruitmentYoyMetrics => {
  const journeyWindow = journeyPoints.filter((p) => termLabels.includes(p.label));
  const activeWindow = activeMemberTotals.filter((p) => termLabels.includes(p.label));

  return {
    bestByNewActiveMembers: extremeLabel(journeyWindow, (p) => p.newActiveMembers, true),
    bestByOnboarded: extremeLabel(journeyWindow, (p) => p.onboarded, true),
    worstByNewActiveMembers: extremeLabel(journeyWindow, (p) => p.newActiveMembers, false),
    worstByOnboarded: extremeLabel(journeyWindow, (p) => p.onboarded, false),
    averageNewActiveMembers: average(journeyWindow.map((p) => p.newActiveMembers)),
    averageActiveMembers: average(activeWindow.map((p) => p.total)),
    recruitmentGrowth: yoyGrowth(journeyWindow, journeyPoints, (p) => p.signUps),
    newActiveMemberGrowth: yoyGrowth(journeyWindow, journeyPoints, (p) => p.newActiveMembers),
    activeMemberGrowth: yoyGrowth(activeWindow, activeMemberTotals, (p) => p.total)
  };
};
