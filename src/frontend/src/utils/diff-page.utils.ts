import {
  DescriptionBullet,
  Link,
  Project,
  ProjectProposedChanges,
  TeamPreview,
  User,
  WbsElement,
  WbsElementStatus,
  WbsNumber,
  WorkPackage,
  WorkPackageProposedChanges,
  WorkPackageStage,
  equalsWbsNumber,
  wbsPipe
} from 'shared';
import { datePipe, displayEnum, dollarsPipe, fullNamePipe } from './pipes';
import { Theme } from '@mui/material';

export type ProposedChangeValue =
  | string
  | number
  | string[]
  | User
  | TeamPreview[]
  | DescriptionBullet[]
  | Link[]
  | Date
  | WbsNumber[];

export interface ChangeBullet {
  label: string;
  detail: ProposedChangeValue;
}

export interface ComparableObject {
  key: string;
  value: string | ComparableObject[];
  changed: boolean;
}

export interface ComparableCollection {
  lines: ComparableLine[];
  label: string;
}

export interface ComparableLine {
  original: ComparableObject;
  new: ComparableObject;
}

export const changeBulletDetailText = (changeBullet: ChangeBullet): string | string[] => {
  const { label, detail } = changeBullet;
  if (detail === undefined) return 'None';
  else if (detail instanceof Date) {
    return datePipe(detail);
  } else if (typeof detail === 'string') {
    return Object.values<string>(WorkPackageStage).includes(detail) ||
      Object.values<string>(WbsElementStatus).includes(detail)
      ? displayEnum(detail)
      : new Date(detail).toString() !== 'Invalid Date'
        ? datePipe(new Date(detail))
        : detail;
  } else if (typeof detail === 'number') {
    return label === 'budget' ? dollarsPipe(detail) : detail.toString();
  } else if ('firstName' in detail) {
    return fullNamePipe(detail);
  } else if (detail.length === 0) {
    return 'None';
  }
  // detail is a non-empty array
  const [testVal] = detail;

  if (typeof testVal === 'string') {
    return detail as string[];
  } else if ('teamName' in testVal) {
    return (detail as TeamPreview[]).map((team) => team.teamName);
  } else if ('detail' in testVal && 'type' in testVal) {
    return (detail as DescriptionBullet[]).map((bullet) => bullet.detail);
  } else if ('carNumber' in testVal) {
    return (detail as WbsNumber[]).map(wbsPipe);
  } else if ('linkType' in testVal) {
    return (detail as Link[]).map((link) => `${link.linkType.name}: ${link.url}`);
  }
  return '';
};

export enum PotentialChangeType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  SAME = 'SAME'
}

export const getPotentialChangeBackground = (potentialChangeType: PotentialChangeType, theme: Theme) => {
  switch (potentialChangeType) {
    case PotentialChangeType.ADDED:
      return '#51915c';
    case PotentialChangeType.REMOVED:
      return '#8a4e4e';
    case PotentialChangeType.SAME:
      return theme.palette.background.paper;
  }
};

const genChange = (key: string, changed: boolean, originalValue: string, newValue: string): ComparableLine => {
  return {
    original: {
      key,
      changed,
      value: originalValue
    },
    new: {
      key,
      changed,
      value: newValue
    }
  };
};

interface DisplayableObejct {
  value: string;
}

export const genListChange = <T extends DisplayableObejct>(
  key: string,
  defaultValue: string,
  originalValues: T[],
  newValues: T[],
  comparator: (a: T | undefined, b: T | undefined) => boolean
): ComparableLine => {
  return {
    original: {
      key,
      changed: false,
      value: originalValues.map((db, i) => ({
        key,
        changed: comparator(db, newValues[i]),
        value: db.value ?? defaultValue
      }))
    },
    new: {
      key,
      changed: false,
      value: newValues.map((db, i) => ({
        key,
        changed: comparator(originalValues[i], db),
        value: db.value ?? defaultValue
      }))
    }
  };
};

export const getWbsChanges = (
  originalElement?: WbsElement,
  proposedChanges?: ProjectProposedChanges | WorkPackageProposedChanges
) => {
  const lines: ComparableLine[] = [];

  const namesChanged = originalElement?.name !== proposedChanges?.name;
  lines.push(genChange('Title', namesChanged, originalElement?.name ?? '', proposedChanges?.name ?? ''));

  const leadChanged = originalElement?.lead?.userId !== proposedChanges?.lead?.userId;
  lines.push(genChange('Lead', leadChanged, fullNamePipe(originalElement?.lead), fullNamePipe(proposedChanges?.lead)));

  const managerChanged = originalElement?.manager?.userId !== proposedChanges?.manager?.userId;
  lines.push(
    genChange('Manager', managerChanged, fullNamePipe(originalElement?.manager), fullNamePipe(proposedChanges?.manager))
  );

  lines.push(
    genListChange(
      'Links',
      '',
      (originalElement?.links.map((link) => ({ ...link, value: link.linkType.name + ' - ' + link.url })) ?? []).sort(
        (a, b) => a.value.localeCompare(b.value)
      ),
      (proposedChanges?.links.map((link) => ({ ...link, value: link.linkType.name + ' - ' + link.url })) ?? []).sort(
        (a, b) => a.value.localeCompare(b.value)
      ),
      (a, b) => a?.url !== b?.url || a?.linkType.name !== b?.linkType.name
    )
  );

  const bulletTypes = Array.from(
    new Set([
      ...(originalElement?.descriptionBullets.map((db) => db.type) ?? []),
      ...(proposedChanges?.descriptionBullets.map((db) => db.type) ?? [])
    ])
  );

  bulletTypes.forEach((type) => {
    const originalBullets = (originalElement?.descriptionBullets.filter((db) => db.type === type) ?? [])
      .map((db) => ({ ...db, value: db.detail }))
      .sort((a, b) => a.value.localeCompare(b.value));

    const proposedBullets = (proposedChanges?.descriptionBullets.filter((db) => db.type === type) ?? [])
      .map((db) => ({ ...db, value: db.detail }))
      .sort((a, b) => a.value.localeCompare(b.value));

    lines.push(genListChange(displayEnum(type), '', originalBullets, proposedBullets, (a, b) => a?.value !== b?.value));
  });

  return lines;
};

export const getChangesForProject = (
  proposedChanges: ProjectProposedChanges,
  originalProject?: Project
): ComparableCollection[] => {
  const projectLines: ComparableLine[] = [...getWbsChanges(originalProject, proposedChanges)];

  projectLines.push(
    genChange(
      'Summary',
      originalProject?.summary !== proposedChanges.summary,
      originalProject ? originalProject.summary : '',
      proposedChanges.summary
    )
  );

  projectLines.push(
    genChange(
      'Budget',
      originalProject?.budget !== proposedChanges.budget,
      originalProject ? `$${originalProject.budget}` : '',
      `$${proposedChanges.budget}`
    )
  );

  projectLines.push(
    genListChange(
      'Teams',
      '',
      originalProject
        ? originalProject.teams
            .map((team) => ({ ...team, value: team.teamName }))
            .sort((a, b) => a.teamName.localeCompare(b.teamName))
        : [],
      proposedChanges.teams
        .map((team) => ({ ...team, value: team.teamName }))
        .sort((a, b) => a.teamName.localeCompare(b.teamName)),
      (a, b) => a?.teamId !== b?.teamId
    )
  );

  const workPackageCollections: ComparableCollection[] = [];

  originalProject?.workPackages.forEach((workPackage) => {
    const newWorkPackage = proposedChanges.workPackageProposedChanges.find((wp) => wp.name === workPackage.name); // TODO ideally do this based on something unique, maybe add a reference to original wbsElementid or something this also just doesnt work if the name has changed so... I dont see another way to identify them though
    if (newWorkPackage) {
      const workPackageLines = getChangesForWorkPackage(workPackage, newWorkPackage);
      workPackageCollections.push(workPackageLines);
      proposedChanges.workPackageProposedChanges = proposedChanges.workPackageProposedChanges.filter(
        (wp) => wp.id !== newWorkPackage.id
      );
    }
  });

  proposedChanges.workPackageProposedChanges.forEach((wp) => {
    workPackageCollections.push(getChangesForWorkPackage(undefined, wp));
  });

  return [{ label: originalProject ? originalProject.name : '', lines: projectLines }, ...workPackageCollections];
};

export const getChangesForWorkPackage = (
  originalWorkPackage?: WorkPackage,
  proposedChanges?: WorkPackageProposedChanges
): ComparableCollection => {
  const lines: ComparableLine[] = [];

  lines.push(...getWbsChanges(originalWorkPackage, proposedChanges));
  lines.push(
    genChange(
      'Start Date',
      originalWorkPackage?.startDate.getTime() !== proposedChanges?.startDate.getTime(),
      datePipe(originalWorkPackage?.startDate),
      datePipe(proposedChanges?.startDate)
    )
  );

  lines.push(
    genChange(
      'Duration',
      originalWorkPackage?.duration !== proposedChanges?.duration,
      originalWorkPackage ? `${originalWorkPackage.duration} weeks` : '',
      proposedChanges ? `${proposedChanges.duration} weeks` : ''
    )
  );

  const statusChanged = originalWorkPackage?.status !== proposedChanges?.status;
  lines.push(genChange('Status', statusChanged, originalWorkPackage?.status ?? '', proposedChanges?.status ?? ''));

  let proposedChangesEndDate;

  if (proposedChanges) {
    proposedChangesEndDate = new Date(proposedChanges.startDate);
    proposedChangesEndDate.setDate(proposedChangesEndDate.getDate() + proposedChanges.duration * 7);
  }

  lines.push(
    genChange(
      'End Date',
      originalWorkPackage?.endDate && proposedChangesEndDate
        ? datePipe(originalWorkPackage.endDate) !== datePipe(proposedChangesEndDate)
        : !!originalWorkPackage?.endDate !== !!proposedChangesEndDate,
      datePipe(originalWorkPackage?.endDate),
      datePipe(proposedChangesEndDate)
    )
  );

  lines.push(
    genListChange(
      'Blocked By',
      '',
      originalWorkPackage?.blockedBy.map((wbsNum) => ({ ...wbsNum, value: wbsPipe(wbsNum) })) ?? [],
      proposedChanges?.blockedBy.map((wbsNum) => ({ ...wbsNum, value: wbsPipe(wbsNum) })) ?? [],
      (a, b) => a !== undefined && b !== undefined && equalsWbsNumber(a, b)
    )
  );

  lines.push(
    genChange(
      'stage',
      originalWorkPackage?.stage !== proposedChanges?.stage,
      originalWorkPackage ? (originalWorkPackage.stage ?? 'NONE') : '',
      proposedChanges ? (proposedChanges.stage ?? 'NONE') : ''
    )
  );

  return { label: originalWorkPackage?.name ?? 'Work Package', lines };
};
