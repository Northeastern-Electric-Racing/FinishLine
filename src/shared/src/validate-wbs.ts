/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber } from './types/project-types';

/**
 * Ensure the provided wbsNum is a valid Work Breakdown Structure Number
 *
 * @param wbsNum WBS number to validate
 */
export const validateWBS = (wbsNum: string): WbsNumber => {
  const errorMsg: string = 'WBS Invalid: ';
  if (wbsNum == null || wbsNum === undefined) {
    throw new Error(errorMsg + 'given WBS # is null');
  }
  if (wbsNum.match(/\./g) == null) {
    throw new Error(errorMsg + 'WBS #s include periods, none found');
  }
  const parseSections: string[] = wbsNum.split('.');
  if (parseSections.length !== 3) {
    throw new Error(errorMsg + 'incorrect number of periods');
  }
  const parseWbs: number[] = parseSections.map((str) => {
    const num: number = parseInt(str);
    if (isNaN(num)) {
      throw new Error(errorMsg + 'Found characters where numbers were expected in WBS #');
    }
    if (num < 0) {
      throw new Error(errorMsg + 'WBS #s must be greater than or equal to 0');
    }
    return num;
  });
  return {
    carNumber: parseWbs[0],
    projectNumber: parseWbs[1],
    workPackageNumber: parseWbs[2]
  };
};

/**
 * Is the provided WbsNumber for a project?
 *
 * @param wbsNum WBS number to check
 */
export const isProject = (wbsNum: WbsNumber) => {
  return wbsNum.workPackageNumber === 0;
};

/**
 * Are the two given WbsNumber equal?
 *
 * @param wbsNum1 first WbsNumber to compare
 * @param wbsNum2 second WbsNumber to compare
 */
export const equalsWbsNumber = (wbsNum1: WbsNumber, wbsNum2: WbsNumber): boolean => {
  return (
    wbsNum1.carNumber === wbsNum2.carNumber &&
    wbsNum1.projectNumber === wbsNum2.projectNumber &&
    wbsNum1.workPackageNumber === wbsNum2.workPackageNumber
  );
};
