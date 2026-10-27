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
