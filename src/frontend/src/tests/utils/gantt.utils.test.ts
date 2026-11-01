/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  sortWbs,
  getColumns,
  isCurrentColumn,
  getPixelsPerDay,
  getDateOffsetPx,
  getElementWidthPx,
  snapToColumn,
  getColumnWidthPx,
  getGanttScale,
  getElementPositionPx,
  getHeaderGroups,
  getGanttDateBounds,
  formatColumnLabel,
  formatGroupLabel,
  GanttTimeUnit,
  GanttTimeWindow
} from '../../utils/gantt.utils';
import { WbsNumber } from 'shared';

const exampleWBS1: WbsNumber = {
  carNumber: 0,
  projectNumber: 0,
  workPackageNumber: 0
};

const exampleWBS2: WbsNumber = {
  carNumber: 0,
  projectNumber: 1,
  workPackageNumber: 2
};

const exampleWBS3: WbsNumber = {
  carNumber: 0,
  projectNumber: 7,
  workPackageNumber: 12
};

const exampleWBS4: WbsNumber = {
  carNumber: 1,
  projectNumber: 56,
  workPackageNumber: 44
};

const exampleWBS5: WbsNumber = {
  carNumber: 1,
  projectNumber: 7,
  workPackageNumber: 12
};

const exampleWBS6: WbsNumber = {
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 12
};

const exampleWBS7: WbsNumber = {
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 44
};

describe('Sort WBS Numbers', () => {
  it('equal wbsNums, asc', () => {
    expect(sortWbs({ wbsNum: exampleWBS1 }, { wbsNum: exampleWBS1 })).toEqual(0);
  });

  it('equal wbsNums with different values for each part', () => {
    expect(sortWbs({ wbsNum: exampleWBS2 }, { wbsNum: exampleWBS2 })).toEqual(0);
  });

  it('a.carNumber < b.carNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS3 }, { wbsNum: exampleWBS4 })).toBeLessThan(0);
  });

  it('a.carNumber > b.carNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS4 }, { wbsNum: exampleWBS3 })).toBeGreaterThan(0);
  });

  it('a.projectNumber < b.projectNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS5 }, { wbsNum: exampleWBS4 })).toBeLessThan(0);
  });

  it('a.projectNumber > b.projectNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS4 }, { wbsNum: exampleWBS5 })).toBeGreaterThan(0);
  });

  it('a.workPackageNumber < b.workPackageNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS6 }, { wbsNum: exampleWBS7 })).toBeLessThan(0);
  });

  it('a.workPackageNumber > b.workPackageNumber', () => {
    expect(sortWbs({ wbsNum: exampleWBS7 }, { wbsNum: exampleWBS6 })).toBeGreaterThan(0);
  });
});

describe('Gantt time window columns', () => {
  // Wednesday, March 4, 2026 through Wednesday, March 25, 2026
  const start = new Date(2026, 2, 4);
  const end = new Date(2026, 2, 25);

  it('day columns include every day', () => {
    const columns = getColumns(start, end, GanttTimeUnit.Day);
    expect(columns.length).toBe(22);
    expect(columns[0]).toEqual(new Date(2026, 2, 4));
  });

  it('week columns start on the Monday of the first week', () => {
    const columns = getColumns(start, end, GanttTimeUnit.Week);
    expect(columns).toEqual([new Date(2026, 2, 2), new Date(2026, 2, 9), new Date(2026, 2, 16), new Date(2026, 2, 23)]);
  });

  it('month columns start on the first of each month', () => {
    const columns = getColumns(new Date(2026, 0, 15), new Date(2026, 3, 1), GanttTimeUnit.Month);
    expect(columns).toEqual([new Date(2026, 0, 1), new Date(2026, 1, 1), new Date(2026, 2, 1), new Date(2026, 3, 1)]);
  });
});

describe('Gantt time window current column', () => {
  const today = new Date(2026, 9, 28, 15, 30); // Wednesday, October 28, 2026, mid-afternoon

  it('matches the same day regardless of time', () => {
    expect(isCurrentColumn(new Date(2026, 9, 28), GanttTimeUnit.Day, today)).toBe(true);
    expect(isCurrentColumn(new Date(2026, 9, 27), GanttTimeUnit.Day, today)).toBe(false);
  });

  it('matches any day in the same Monday-starting week', () => {
    expect(isCurrentColumn(new Date(2026, 9, 26), GanttTimeUnit.Week, today)).toBe(true);
    expect(isCurrentColumn(new Date(2026, 10, 1), GanttTimeUnit.Week, today)).toBe(true);
    expect(isCurrentColumn(new Date(2026, 9, 25), GanttTimeUnit.Week, today)).toBe(false);
  });

  it('matches any day in the same month', () => {
    expect(isCurrentColumn(new Date(2026, 9, 1), GanttTimeUnit.Month, today)).toBe(true);
    expect(isCurrentColumn(new Date(2026, 10, 1), GanttTimeUnit.Month, today)).toBe(false);
  });
});

describe('Gantt time window sizing', () => {
  it('fits the visible span into the viewport', () => {
    expect(getPixelsPerDay(GanttTimeWindow.Week, 1400)).toBe(100);
  });

  it('positions dates by day', () => {
    expect(getDateOffsetPx(new Date(2026, 2, 11), new Date(2026, 2, 1), 5)).toBe(50);
  });

  it('uses the real length when it is above the minimum', () => {
    expect(getElementWidthPx(new Date(2026, 2, 2), new Date(2026, 2, 30), GanttTimeWindow.Year, 2)).toBe(56);
  });

  it('widens a one week element to two weeks in year view', () => {
    expect(getElementWidthPx(new Date(2026, 2, 2), new Date(2026, 2, 9), GanttTimeWindow.Year, 2)).toBe(28);
  });

  it('gives a same-day element a one day minimum in week view', () => {
    expect(getElementWidthPx(new Date(2026, 2, 2), new Date(2026, 2, 2), GanttTimeWindow.Week, 100)).toBe(100);
  });
});

describe('Gantt time window snapping', () => {
  it('snaps to the start of the current week when early in the week', () => {
    expect(snapToColumn(new Date(2026, 2, 4), GanttTimeUnit.Week)).toEqual(new Date(2026, 2, 2));
  });

  it('snaps to the start of the next week when late in the week', () => {
    expect(snapToColumn(new Date(2026, 2, 7), GanttTimeUnit.Week)).toEqual(new Date(2026, 2, 9));
  });

  it('snaps to the nearest month', () => {
    expect(snapToColumn(new Date(2026, 2, 10), GanttTimeUnit.Month)).toEqual(new Date(2026, 2, 1));
    expect(snapToColumn(new Date(2026, 2, 25), GanttTimeUnit.Month)).toEqual(new Date(2026, 3, 1));
  });
});

describe('Gantt time window column widths', () => {
  it('gives week columns seven days', () => {
    expect(getColumnWidthPx(new Date(2026, 2, 2), GanttTimeUnit.Week, 10)).toBe(70);
  });

  it('gives month columns their real length', () => {
    expect(getColumnWidthPx(new Date(2026, 1, 1), GanttTimeUnit.Month, 10)).toBe(280);
    expect(getColumnWidthPx(new Date(2026, 2, 1), GanttTimeUnit.Month, 10)).toBe(310);
  });
});

describe('Gantt chart scale', () => {
  const dataStart = new Date(2026, 2, 4); // Wednesday, March 4, 2026
  const dataEnd = new Date(2026, 4, 20); // Wednesday, May 20, 2026

  it('pads one visible span on each side and lines up with columns', () => {
    const scale = getGanttScale(dataStart, dataEnd, GanttTimeWindow.Month, 1400);
    expect(scale.start).toEqual(new Date(2025, 11, 29)); // Monday of the week two months before (Sunday, Jan 4)
    expect(scale.end).toEqual(new Date(2026, 6, 27)); // Monday after the week two months after
    expect(scale.columns[0]).toEqual(scale.start);
    expect(scale.columns.every((column) => column.getDay() === 1)).toBe(true);
  });

  it('makes the chart as wide as its days', () => {
    const scale = getGanttScale(dataStart, dataEnd, GanttTimeWindow.Week, 1400);
    expect(scale.pixelsPerDay).toBe(100);
    expect(scale.widthPx).toBe(scale.columns.length * 100);
  });

  it('uses month columns in year view', () => {
    const scale = getGanttScale(dataStart, dataEnd, GanttTimeWindow.Year);
    expect(scale.columns.every((column) => column.getDate() === 1)).toBe(true);
  });
});

describe('Gantt element positions', () => {
  const scale = getGanttScale(new Date(2026, 2, 2), new Date(2026, 2, 30), GanttTimeWindow.Week, 1400);

  it('places an element at its start date', () => {
    const start = new Date(2026, 2, 2);
    const position = getElementPositionPx(start, new Date(2026, 2, 5), scale);
    expect(position.left).toBe(14 * 100); // two week padding before the data
    expect(position.width).toBe(300);
  });

  it('applies the minimum width', () => {
    const yearScale = getGanttScale(new Date(2026, 2, 2), new Date(2026, 2, 30), GanttTimeWindow.Year);
    const position = getElementPositionPx(new Date(2026, 2, 2), new Date(2026, 2, 9), yearScale);
    expect(position.width).toBeCloseTo(14 * yearScale.pixelsPerDay);
  });

  it('clips elements that run off the start of the chart', () => {
    const position = getElementPositionPx(new Date(2026, 1, 1), new Date(2026, 1, 20), scale);
    expect(position.left).toBe(0);
    expect(position.width).toBe(400); // Feb 16 (chart start) to Feb 20
  });
});

describe('Gantt header groups', () => {
  it('clips the first and last groups to the chart', () => {
    const scale = getGanttScale(new Date(2026, 2, 2), new Date(2026, 2, 30), GanttTimeWindow.Week, 1400);
    const groups = getHeaderGroups(scale);
    expect(groups[0].start).toEqual(scale.start);
    expect(groups.reduce((total, group) => total + group.widthPx, 0)).toBe(scale.widthPx);
  });

  it('formats labels by unit', () => {
    expect(formatColumnLabel(new Date(2026, 2, 9), GanttTimeUnit.Week)).toBe('9');
    expect(formatColumnLabel(new Date(2026, 2, 1), GanttTimeUnit.Month)).toBe('Mar');
    expect(formatGroupLabel(new Date(2026, 2, 1), GanttTimeUnit.Month)).toBe('Mar 2026');
    expect(formatGroupLabel(new Date(2026, 0, 1), GanttTimeUnit.Year)).toBe('2026');
  });
});

describe('Gantt date bounds', () => {
  it('finds the earliest start and latest end', () => {
    const bounds = getGanttDateBounds([
      { startDate: new Date(2026, 2, 9), endDate: new Date(2026, 3, 6) },
      { startDate: new Date(2026, 2, 2), endDate: new Date(2026, 2, 16) }
    ]);
    expect(bounds).toEqual({ start: new Date(2026, 2, 2), end: new Date(2026, 3, 6) });
  });
});
