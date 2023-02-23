/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { sortWbs } from '../../utils/gantt.utils';
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
