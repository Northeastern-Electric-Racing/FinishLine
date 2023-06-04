import { LinkCreateArgs } from 'shared';

export enum ChangeType {
  ADDED = 'Added new',
  REMOVED = 'Removed',
  EDITED = 'Edited'
}

export interface ChangeCreateArgs {
  changeRequestId: number;
  implementerId: number;
  wbsElementId: number;
  detail: string;
}

export interface ChangeListValue<T> {
  element: T;
  comparator: string;
  displayValue: string;
}

export const linkToChangeListValue = (link: LinkCreateArgs) => {
  return {
    element: link,
    comparator: link.linkId,
    displayValue: link.url
  };
};

export const buildChangeDetail = (itemChanged: string, oldValue: string, newValue: string): string => {
  return `Changed ${itemChanged} from "${oldValue}" to "${newValue}"`;
};

/**
 * returns a change if the old and new value are different, otherwise return undefined
 * @param nameOfField the name of the field being changed
 * @param oldValue the old value of whats being updated
 * @param newValue the new value of whats being updated
 * @param crId the change request id for the CR that is responsible for the change
 * @param implementerId the person implementing the change request
 * @param wbsElementId the wbs element id of whats being changed
 * @returns the change
 */
export const createChange = (
  nameOfField: string,
  oldValue: string | number | null,
  newValue: string | number | null,
  crId: number,
  implementerId: number,
  wbsElementId: number
): ChangeCreateArgs | undefined => {
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
      detail: buildChangeDetail(nameOfField, `${oldValue}`, `${newValue}`)
    };
  }
  return undefined;
};

/**
 * this method creates changes for description bullet inputs it returns it as an object of {deletedElements[], addedElements[] changes[]} because the deletedElements are needed for the database and the addedElements are needed to make new ones
 * @param oldArray the old values to be updated
 * @param newArray the new values were updating to
 * @param crId the change request responsible for the changes
 * @param implementerId the id of the person implementing the changes
 * @param wbsElementId the wbs element of whats being affected
 * @param nameOfField the name of the field being changed
 * @returns an object of {deletedElements[], addedElements[] changes[]}
 */
export const createListChanges = <T>(
  oldArray: ChangeListValue<T>[],
  newArray: ChangeListValue<T>[],
  crId: number,
  implementerId: number,
  wbsElementId: number,
  nameOfField: string
): {
  deletedElements: T[];
  addedElements: T[];
  editedElements: T[];
  changes: ChangeCreateArgs[];
} => {
  const seenOld = new Map<string, string>(
    oldArray.map((changeListValue) => [changeListValue.comparator, changeListValue.displayValue])
  );
  const seenNew = new Map<string, string>(
    newArray.map((changeListValue) => [changeListValue.comparator, changeListValue.displayValue])
  );

  const changes: { changeListValue: ChangeListValue<T>; type: ChangeType }[] = [];

  oldArray.forEach((changeListValue) => {
    if (!seenNew.has(changeListValue.comparator)) {
      changes.push({ changeListValue, type: ChangeType.REMOVED });
    }
  });

  newArray.forEach((changeListValue) => {
    if (changeListValue.comparator === "-1" || !seenOld.has(changeListValue.comparator)) {
      changes.push({ changeListValue, type: ChangeType.ADDED });
    } else if (seenOld.get(changeListValue.comparator) !== changeListValue.displayValue) {
      changes.push({ changeListValue, type: ChangeType.EDITED });
    }
  });

  return {
    deletedElements: changes
      .filter((change) => change.type === ChangeType.REMOVED)
      .map((removed) => removed.changeListValue.element),
    addedElements: changes
      .filter((change) => change.type === ChangeType.ADDED)
      .map((added) => added.changeListValue.element),
    editedElements: changes
      .filter((change) => change.type === ChangeType.EDITED)
      .map((edited) => edited.changeListValue.element),
    changes: changes.map((change) => {
      const detail =
        change.type === ChangeType.EDITED
          ? buildChangeDetail(
              nameOfField,
              seenOld.get(change.changeListValue.comparator) || 'null',
              seenNew.get(change.changeListValue.comparator) || 'null'
            )
          : `${change.type} ${nameOfField} "${change.changeListValue.displayValue}"`;
      return { changeRequestId: crId, implementerId, wbsElementId, detail };
    })
  };
};

// // returns a change if the old and new dates are different, otherwise return undefined
// export const createChangeJsonDates = (
//   nameOfField: string,
//   oldValue: Date,
//   newValue: Date,
//   crId: number,
//   implementerId: number,
//   wbsElementId: number
// ) => {
//   // toUTCString gives a date like "Fri, 01 Jan 2021 00:00:00 GMT" and we just want to compare those first four words
//   const oldDate = oldValue.toUTCString().split(' ').splice(0, 4).join();
//   const newDate = newValue.toUTCString().split(' ').splice(0, 4).join();
//   if (oldDate !== newDate) {
//     return {
//       changeRequestId: crId,
//       implementerId,
//       wbsElementId,
//       detail: buildChangeDetail(nameOfField, oldValue.toUTCString(), newValue.toUTCString())
//     };
//   }
//   return undefined;
// };

// // create a change json list for a given list (blocked by). Only works if the elements themselves should be compared (numbers)
// export const createBlockedByChangesJson = async (
//   oldArray: number[],
//   newArray: number[],
//   crId: number,
//   implementerId: number,
//   wbsElementId: number,
//   nameOfField: string
// ) => {
//   const seenOld = new Set<number>(oldArray);
//   const seenNew = new Set<number>(newArray);

//   const changes: { element: number; type: ChangeType }[] = [];

//   oldArray.forEach((element) => {
//     if (!seenNew.has(element)) {
//       changes.push({ element, type: ChangeType.REMOVED });
//     }
//   });

//   newArray.forEach((element) => {
//     if (!seenOld.has(element)) {
//       changes.push({ element, type: ChangeType.ADDED });
//     }
//   });

//   // get the wbs number of each changing blocker for the change string
//   const changedBlocker = await prisma.wBS_Element.findMany({
//     where: { wbsElementId: { in: changes.map((element) => element.element) } }
//   });

//   const wbsNumbers = new Map(
//     changedBlocker.map((element) => [
//       element.wbsElementId,
//       `${element.carNumber}.${element.projectNumber}.${element.workPackageNumber}`
//     ])
//   );

//   return changes.map((element) => {
//     return {
//       changeRequestId: crId,
//       implementerId,
//       wbsElementId,
//       detail: `${element.type} ${nameOfField} "${wbsNumbers.get(element.element)}"`
//     };
//   });
// };

//
// export const createDescriptionBulletChangesJson = (
//   oldArray: DescriptionBullet[],
//   newArray: { id: number; detail: string }[],
//   crId: number,
//   implementerId: number,
//   wbsElementId: number,
//   nameOfField: string
// ): {
//   deletedIds: number[];
//   addedDetails: string[];
//   editedIdsAndDetails: { id: number; detail: string }[];
//   changes: {
//     changeRequestId: number;
//     implementerId: number;
//     wbsElementId: number;
//     detail: string;
//   }[];
// } => {
//   const seenOld = new Map<DescriptionBullet, string>(oldArray.map((ele) => [ele, ele.detail]));
//   const seenNew = new Map<DescriptionBullet, string>(newArray.map((ele) => [ele, ele.detail]));

//   const changes: { element: { id: number; detail: string }; type: ChangeType }[] = [];

//   oldArray.forEach((element) => {
//     if (!seenNew.has(element)) {
//       changes.push({ element: { id: element.id, detail: element.detail }, type: ChangeType.REMOVED });
//     }
//   });

//   newArray.forEach((element) => {
//     if (element.id < 0 || !seenOld.has(element)) {
//       changes.push({ element, type: ChangeType.ADDED });
//     } else if (seenOld.get(element) !== element.detail) {
//       changes.push({ element, type: ChangeType.EDITED });
//     }
//   });

//   return {
//     deletedIds: changes.filter((element) => element.type === ChangeType.REMOVED).map((element) => element.element.id),
//     addedDetails: changes.filter((element) => element.type === ChangeType.ADDED).map((element) => element.element.detail),
//     editedIdsAndDetails: changes.filter((element) => element.type === ChangeType.EDITED).map((element) => element.element),
//     changes: changes.map((element) => {
//       const detail =
//         element.type === ChangeType.EDITED
//           ? buildChangeDetail(
//               nameOfField,
//               seenOld.get(element.element.id) || 'null',
//               seenNew.get(element.element.id) || 'null'
//             )
//           : `${element.type} ${nameOfField} "${element.element.detail}"`;
//       return { changeRequestId: crId, implementerId, wbsElementId, detail };
//     })
//   };
// };

// // create a change json list for a given list (rules). Only works if the elements themselves should be compared (strings)
// export const createRulesChangesJson = (
//   nameOfField: string,
//   oldArray: string[],
//   newArray: string[],
//   crId: number,
//   implementerId: number,
//   wbsElementId: number
// ) => {
//   const seenOld = new Set<string>(oldArray);
//   const seenNew = new Set<string>(newArray);

//   const changes: { element: string; type: ChangeType }[] = [];

//   oldArray.forEach((element) => {
//     if (!seenNew.has(element)) {
//       changes.push({ element, type: ChangeType.REMOVED });
//     }
//   });

//   newArray.forEach((element) => {
//     if (!seenOld.has(element)) {
//       changes.push({ element, type: ChangeType.ADDED });
//     }
//   });

//   return changes.map((element) => {
//     return {
//       changeRequestId: crId,
//       implementerId,
//       wbsElementId,
//       detail: `${element.type} ${nameOfField} "${element.element}"`
//     };
//   });
// };
