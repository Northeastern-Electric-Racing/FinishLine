/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsNumSort } from './projects-table';

describe('sort wbs numbers', () => {
  it('equal wbsNums, asc', () => {
    expect(wbsNumSort('0.0.0', '0.0.0', 'asc')).toEqual(0);
  });

  it('equal wbsNums, desc', () => {
    expect(wbsNumSort('0.0.0', '0.0.0', 'desc')).toEqual(0);
  });

  it('equal wbsNums with different values for each part, asc', () => {
    expect(wbsNumSort('0.1.2', '0.1.2', 'asc')).toEqual(0);
  });

  it('equal wbsNums with different values for each part, desc', () => {
    expect(wbsNumSort('24.36.12', '24.36.12', 'desc')).toEqual(0);
  });

  it('a.carNumber < b.carNumber, asc', () => {
    expect(wbsNumSort('0.7.12', '1.56.44', 'asc')).toEqual(-1);
  });

  it('a.carNumber > b.carNumber, asc', () => {
    expect(wbsNumSort('1.56.44', '0.7.12', 'asc')).toEqual(1);
  });

  it('a.carNumber < b.carNumber, desc', () => {
    expect(wbsNumSort('0.7.12', '1.56.44', 'desc')).toEqual(1);
  });

  it('a.carNumber > b.carNumber, desc', () => {
    expect(wbsNumSort('1.56.44', '0.7.12', 'desc')).toEqual(-1);
  });

  it('a.projectNumber < b.projectNumber, asc', () => {
    expect(wbsNumSort('1.7.12', '1.56.44', 'asc')).toEqual(-49);
  });

  it('a.projectNumber > b.projectNumber, asc', () => {
    expect(wbsNumSort('1.56.44', '1.7.12', 'asc')).toEqual(49);
  });

  it('a.projectNumber < b.projectNumber, desc', () => {
    expect(wbsNumSort('1.7.12', '1.56.44', 'desc')).toEqual(49);
  });

  it('a.projectNumber > b.projectNumber, desc', () => {
    expect(wbsNumSort('1.56.44', '1.7.12', 'desc')).toEqual(-49);
  });

  it('a.workPackageNumber < b.workPackageNumber, asc', () => {
    expect(wbsNumSort('1.2.12', '1.2.44', 'asc')).toEqual(-32);
  });

  it('a.workPackageNumber > b.workPackageNumber, asc', () => {
    expect(wbsNumSort('1.2.44', '1.2.12', 'asc')).toEqual(32);
  });

  it('a.workPackageNumber < b.workPackageNumber, desc', () => {
    expect(wbsNumSort('1.2.12', '1.2.44', 'desc')).toEqual(32);
  });

  it('a.workPackageNumber > b.workPackageNumber, desc', () => {
    expect(wbsNumSort('1.2.44', '1.2.12', 'desc')).toEqual(-32);
  });
});
