import { Description_Bullet, Prisma } from '@prisma/client';
import { DescriptionBullet } from 'shared';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import prisma from '../prisma/prisma';
import { NotFoundException } from './errors.utils';
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
  oldValue: string | number | null,
  newValue: string | number | null,
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

/**
 * Gets all the blocking workpackages for a given work package
 * @param initialWorkPackage the work package that to get the blocking work packages for
 * @returns an array of the blocking work packages
 */
export const getBlockingWorkPackages = async (
  initialWorkPackage: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>
) => {
  // track the wbs element ids we've seen so far so we don't update the same one multiple times
  const seenWbsElementIds: Set<number> = new Set<number>([initialWorkPackage.wbsElement.wbsElementId]);

  // blocking ids that still need to be updated
  const blockingUpdateQueue: number[] = initialWorkPackage.wbsElement.blocking.map((blocking) => blocking.wbsElementId);
  const blockingWorkPackages: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>[] = [];
  while (blockingUpdateQueue.length > 0) {
    const currWbsId = blockingUpdateQueue.pop(); // get the next blocking and remove it from the queue

    if (!currWbsId) break; // this is more of a type check for pop becuase the while loop prevents this from not existing
    if (seenWbsElementIds.has(currWbsId)) continue; // if we've already seen it we skip it

    seenWbsElementIds.add(currWbsId);

    // get the current wbs object from prisma
    const currWbs = await prisma.wBS_Element.findUnique({
      where: { wbsElementId: currWbsId },
      include: {
        blocking: true,
        workPackage: { ...workPackageQueryArgs }
      }
    });

    if (!currWbs) throw new NotFoundException('WBS Element', currWbsId);
    if (!currWbs.workPackage) continue; // this wbs element is a project so skip it

    // get all the blockings of the current wbs and add them to the queue to update
    const newBlocking: number[] = currWbs.blocking.map((blocking) => blocking.wbsElementId);
    blockingUpdateQueue.push(...newBlocking);
    blockingWorkPackages.push(currWbs.workPackage);
  }

  return (blockingWorkPackages);
};
