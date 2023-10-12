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
  if (oldValue == null && newValue !== null) {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: `Added ${nameOfField} "${newValue}"`
    };
  } else if (oldValue !== null && newValue == null) {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: `Deleted ${nameOfField} "${oldValue}"`
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
  nameOfField: string,
  oldArray: ChangeListValue<T>[],
  newArray: ChangeListValue<T>[],
  crId: number,
  implementerId: number,
  wbsElementId: number
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
    if (changeListValue.comparator === '-1' || !seenOld.has(changeListValue.comparator)) {
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
