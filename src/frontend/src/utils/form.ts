/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, DescriptionBulletPreview, validateWBS } from 'shared';

/*
 * maps a description bullet list to the object needed for forms
 * can't use `id` instead of `bulletId` because react-hook-forms uses id built in for arrays of objects
 */
export const bulletsToObject = (bullets: DescriptionBullet[]): DescriptionBulletPreview[] =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { bulletId: bullet.id, detail: bullet.detail, id: bullet.id, type: bullet.type };
    });

/*
 * maps a list of rules to the object needed for forms
 * uses the index in the array as the bulletId
 */
export const rulesToObject = (rules: string[]) =>
  rules.map((rule, bulletId) => {
    return { bulletId, detail: rule };
  });

// transforms the bullets made by react-hook-forms to the objects needed for the payload to the backend
export const mapBulletsToPayload = (
  ls: { bulletId: string; detail: string; type: string }[]
): DescriptionBulletPreview[] => {
  return ls.map((ele) => {
    return { id: ele.bulletId, detail: ele.detail, type: ele.type };
  });
};

/**
 * Tests if a WBS is valid
 * @param wbsNum
 */
export const wbsTester = (wbsNum: string | undefined) => {
  if (!wbsNum) return false;
  try {
    validateWBS(wbsNum);
  } catch (error) {
    return false;
  }
  return true;
};

/**
 * Tests if a start date is valid
 * @param startDate
 */
export const startDateTester = (startDate: Date | undefined) => {
  if (startDate === undefined || startDate.getDay() !== 1) {
    return false;
  }
  return true;
};

export enum WPFormType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  CREATEWITHCR = 'CREATEWITHCR'
}

/**
 * Creates a UUID
 */
export const generateUUID = () => {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export enum FormStorageKey {
  CREATE_TEAM_TYPE = 'CREATE_TEAM_TYPE',
  CREATE_MILESTONE = 'CREATE_MILESTONE',
  EDIT_MILESTONE = 'EDIT_MILESTONE',
}
