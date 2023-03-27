import { Description_Bullet } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import prisma from '../prisma/prisma';
import { buildChangeDetail } from './utils';

export const calculateWorkPackageProgress = (
  deliverables: Description_Bullet[],
  expectedActivities: Description_Bullet[]
) => {
  const bullets = deliverables.concat(expectedActivities);
  return bullets.length === 0 ? 0 : Math.floor((bullets.filter((b) => b.dateTimeChecked).length / bullets.length) * 100);
};

// create a change json if the old and new value are different, otherwise return undefined
export const createChangeJsonNonList = (
  nameOfField: string,
  oldValue: any,
  newValue: any,
  crId: number,
  implementerId: number,
  wbsElementId: number
) => {
  if (oldValue == null) {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: `Added ${nameOfField} "${newValue}"`
    };
  } else if (oldValue !== newValue) {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: buildChangeDetail(nameOfField, oldValue, newValue)
    };
  }
  return undefined;
};

// create a change json if the old and new value are different, otherwise return undefined
export const createChange = (nameOfField: string, oldValue: any, newValue: any, crId: number, implementerId: number) => {
  if (oldValue == null) {
    return {
      changeRequestId: crId,
      implementerId,
      detail: `Added ${nameOfField} "${newValue}"`
    };
  } else if (oldValue !== null && newValue === null) {
    return {
      changeRequestId: crId,
      implementerId,
      detail: `Removed ${nameOfField} "${oldValue}"`
    };
  } else if (oldValue !== newValue && newValue !== null) {
    return {
      changeRequestId: crId,
      implementerId,
      detail: buildChangeDetail(nameOfField, oldValue, newValue)
    };
  }
  return undefined;
};

// create a change json if the old and new dates are different, otherwise return undefined
export const createChangeJsonDates = (
  nameOfField: string,
  oldValue: Date,
  newValue: Date,
  crId: number,
  implementerId: number,
  wbsElementId: number
) => {
  // toUTCString gives a date like "Fri, 01 Jan 2021 00:00:00 GMT" and we just want to compare those first four words
  const oldDate = oldValue.toUTCString().split(' ').splice(0, 4).join();
  const newDate = newValue.toUTCString().split(' ').splice(0, 4).join();
  if (oldDate !== newDate) {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: buildChangeDetail(nameOfField, oldValue.toUTCString(), newValue.toUTCString())
    };
  }
  return undefined;
};

// create a change json list for a given list (blocked by). Only works if the elements themselves should be compared (numbers)
export const createBlockedByChangesJson = async (
  oldArray: number[],
  newArray: number[],
  crId: number,
  implementerId: number,
  wbsElementId: number,
  nameOfField: string
) => {
  const seenOld = new Set<number>(oldArray);
  const seenNew = new Set<number>(newArray);

  const changes: { element: number; type: string }[] = [];

  oldArray.forEach((element) => {
    if (!seenNew.has(element)) {
      changes.push({ element, type: 'Removed' });
    }
  });

  newArray.forEach((element) => {
    if (!seenOld.has(element)) {
      changes.push({ element, type: 'Added new' });
    }
  });

  // get the wbs number of each changing blocker for the change string
  const changedBlocker = await prisma.wBS_Element.findMany({
    where: { wbsElementId: { in: changes.map((element) => element.element) } }
  });

  const wbsNumbers = new Map(
    changedBlocker.map((element) => [
      element.wbsElementId,
      `${element.carNumber}.${element.projectNumber}.${element.workPackageNumber}`
    ])
  );

  return changes.map((element) => {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: `${element.type} ${nameOfField} "${wbsNumbers.get(element.element)}"`
    };
  });
};

// this method creates changes for description bullet inputs
// it returns it as an object of {deletedIds[], addedDetails[] changes[]}
// because the deletedIds are needed for the database and the addedDetails are needed to make new ones
export const createDescriptionBulletChangesJson = (
  oldArray: DescriptionBullet[],
  newArray: { id: number; detail: string }[],
  crId: number,
  implementerId: number,
  wbsElementId: number,
  nameOfField: string
): {
  deletedIds: number[];
  addedDetails: string[];
  editedIdsAndDetails: { id: number; detail: string }[];
  changes: {
    changeRequestId: number;
    implementerId: number;
    wbsElementId: number;
    detail: string;
  }[];
} => {
  const seenOld = new Map<number, string>(oldArray.map((ele) => [ele.id, ele.detail]));
  const seenNew = new Map<number, string>(newArray.map((ele) => [ele.id, ele.detail]));

  const changes: { element: { id: number; detail: string }; type: string }[] = [];

  oldArray.forEach((element) => {
    if (!seenNew.has(element.id)) {
      changes.push({ element: { id: element.id, detail: element.detail }, type: 'Removed' });
    }
  });

  newArray.forEach((element) => {
    if (element.id < 0 || !seenOld.has(element.id)) {
      changes.push({ element, type: 'Added new' });
    } else if (seenOld.get(element.id) !== element.detail) {
      changes.push({ element, type: 'Edited' });
    }
  });

  return {
    deletedIds: changes.filter((element) => element.type === 'Removed').map((element) => element.element.id),
    addedDetails: changes.filter((element) => element.type === 'Added new').map((element) => element.element.detail),
    editedIdsAndDetails: changes.filter((element) => element.type === 'Edited').map((element) => element.element),
    changes: changes.map((element) => {
      const detail =
        element.type === 'Edited'
          ? buildChangeDetail(
              nameOfField,
              seenOld.get(element.element.id) || 'null',
              seenNew.get(element.element.id) || 'null'
            )
          : `${element.type} ${nameOfField} "${element.element.detail}"`;
      return { changeRequestId: crId, implementerId, wbsElementId, detail };
    })
  };
};
