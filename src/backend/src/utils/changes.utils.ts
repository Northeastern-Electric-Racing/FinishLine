import { WBS_Element } from '@prisma/client';
import { DescriptionBulletPreview, WorkPackageStage, wbsPipe } from 'shared';
import { getUserFullName } from './users.utils';
import {
  DescriptionBulletWithType,
  descriptionBulletToChangeListValue,
  descriptionBulletsToChangeListValues,
  separateDescriptionBulletsByType
} from './description-bullets.utils';

export enum ChangeType {
  ADDED = 'Added new',
  REMOVED = 'Removed',
  EDITED = 'Edited'
}

export interface ChangeCreateArgs {
  changeRequestId: string;
  implementerId: string;
  wbsElementId: string;
  detail: string;
}

export interface ChangeListValue<T> {
  element: T;
  comparator: string;
  displayValue: string;
}

export const transformBlockedByToChangeListValue = (blockedBy: WBS_Element): ChangeListValue<WBS_Element> => {
  return {
    element: blockedBy,
    comparator: `${blockedBy.wbsElementId}`,
    displayValue: `${wbsPipe(blockedBy)}`
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
  crId: string,
  implementerId: string,
  wbsElementId: string
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
  crId: string,
  implementerId: string,
  wbsElementId: string
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

export const getWorkPackageChanges = async (
  oldName: string | null,
  newName: string,
  oldStage: string | null,
  newStage: WorkPackageStage | null,
  oldStartDate: Date | null,
  newStartDate: Date,
  oldDuration: number | null,
  newDuration: number,
  oldBlockedBy: WBS_Element[],
  newBlockedBy: WBS_Element[],
  oldManagerId: string | null,
  newManagerId: string | null,
  oldLeadId: string | null,
  newLeadId: string | null,
  oldDescriptionBullets: DescriptionBulletWithType[],
  newDescriptionBullets: DescriptionBulletPreview[],
  crId: string,
  wbsElementId: string,
  submitterId: string
) => {
  let changes: ChangeCreateArgs[] = [];
  const nameChangeJson = createChange('name', oldName, newName, crId, submitterId, wbsElementId);
  const stageChangeJson = createChange('stage', oldStage, newStage, crId, submitterId, wbsElementId);
  const startDateChangeJson = createChange(
    'start date',
    oldStartDate?.toDateString() || null,
    new Date(newStartDate).toDateString(),
    crId,
    submitterId,
    wbsElementId
  );
  const durationChangeJson = createChange('duration', oldDuration, newDuration, crId, submitterId, wbsElementId);
  const blockedByChangeJson = createListChanges(
    'blocked by',
    oldBlockedBy.map(transformBlockedByToChangeListValue),
    newBlockedBy.map(transformBlockedByToChangeListValue),
    crId,
    submitterId,
    wbsElementId
  );

  const managerChange = createChange(
    'manager',
    await getUserFullName(oldManagerId),
    await getUserFullName(newManagerId),
    crId,
    submitterId,
    wbsElementId
  );

  const leadChange = createChange(
    'lead',
    await getUserFullName(oldLeadId),
    await getUserFullName(newLeadId),
    crId,
    submitterId,
    wbsElementId
  );

  const descriptionBulletChanges = await getDescriptionBulletChanges(
    oldDescriptionBullets,
    newDescriptionBullets,
    crId,
    wbsElementId,
    submitterId
  );

  // add to changes if not undefined
  if (nameChangeJson) changes.push(nameChangeJson);
  if (startDateChangeJson) changes.push(startDateChangeJson);
  if (durationChangeJson) changes.push(durationChangeJson);
  if (stageChangeJson) changes.push(stageChangeJson);
  if (leadChange) changes.push(leadChange);
  if (managerChange) changes.push(managerChange);

  // add the changes for each of blockers, expected activities, and deliverables
  changes = changes.concat(blockedByChangeJson.changes).concat(descriptionBulletChanges.changes);

  return {
    changes,
    deletedBlockedBy: blockedByChangeJson.deletedElements,
    addedBlockedBy: blockedByChangeJson.addedElements,
    editedBlockedBy: blockedByChangeJson.editedElements,
    deletedDescriptionBullets: descriptionBulletChanges.deleted,
    addedDescriptionBullets: descriptionBulletChanges.added,
    editedDescriptionBullets: descriptionBulletChanges.edited
  };
};

export const getDescriptionBulletChanges = async (
  oldDescriptionBullets: DescriptionBulletWithType[],
  newDescriptionBullets: DescriptionBulletPreview[],
  crId: string,
  wbsElementId: string,
  submitterId: string
) => {
  const descriptionBulletsSeparatedByType = separateDescriptionBulletsByType(newDescriptionBullets);
  let descriptionBulletChanges: ChangeCreateArgs[] = [];
  let descriptionBulletDeletions: DescriptionBulletPreview[] = [];
  let descriptionBulletAdditions: DescriptionBulletPreview[] = [];
  let descriptionBulletEdits: DescriptionBulletPreview[] = [];

  for (const [type, descriptionBullets] of descriptionBulletsSeparatedByType) {
    const descriptionBulletsChangeJson = createListChanges(
      type,
      descriptionBulletsToChangeListValues(
        oldDescriptionBullets.filter((ele) => !ele.dateDeleted && ele.descriptionBulletType.name === type)
      ),
      descriptionBullets.map(descriptionBulletToChangeListValue),
      crId,
      submitterId,
      wbsElementId
    );

    descriptionBulletChanges = descriptionBulletChanges.concat(descriptionBulletsChangeJson.changes);
    descriptionBulletDeletions = descriptionBulletDeletions.concat(descriptionBulletsChangeJson.deletedElements);
    descriptionBulletAdditions = descriptionBulletAdditions.concat(descriptionBulletsChangeJson.addedElements);
    descriptionBulletEdits = descriptionBulletEdits.concat(descriptionBulletsChangeJson.editedElements);
  }

  return {
    changes: descriptionBulletChanges,
    deleted: descriptionBulletDeletions,
    added: descriptionBulletAdditions,
    edited: descriptionBulletEdits
  };
};
