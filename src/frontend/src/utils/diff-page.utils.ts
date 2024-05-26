import {
  DescriptionBullet,
  Link,
  Project,
  ProjectProposedChanges,
  ProjectProposedChangesPreview,
  TeamPreview,
  User,
  WbsElementStatus,
  WbsNumber,
  WorkPackage,
  WorkPackageProposedChanges,
  WorkPackageProposedChangesPreview,
  WorkPackageStage,
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
  } else if ('id' in testVal) {
    return (detail as DescriptionBullet[]).map((bullet) => bullet.detail);
  } else if ('carNumber' in testVal) {
    return (detail as WbsNumber[]).map(wbsPipe);
  }
  return (detail as Link[]).map((link) => `${link.linkType.name}: ${link.url}`);
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

export const valueChanged = (original: ProposedChangeValue, proposed: ProposedChangeValue) => {
  if (typeof original === 'string' || typeof original === 'number') return original !== proposed;

  if (original === undefined) return proposed !== undefined;
  if (proposed === undefined) return original !== undefined;

  if (original instanceof Date) return datePipe(original) !== datePipe(proposed as Date);

  original = original as string[] | User | TeamPreview[] | DescriptionBullet[] | Link[] | WbsNumber[];
  proposed = proposed as string[] | User | TeamPreview[] | DescriptionBullet[] | Link[] | WbsNumber[];

  if ('firstName' in original) {
    return original.userId !== (proposed as User).userId;
  }

  // they are arrays
  proposed = proposed as string[] | TeamPreview[] | DescriptionBullet[] | Link[];

  if (original.length === 0) return proposed.length !== 0;
  if (proposed.length === 0) return original.length !== 0;

  const [testVal] = original;

  if (testVal === undefined) return proposed[0] !== undefined;
  if (proposed[0] === undefined) return testVal !== undefined;

  if (typeof testVal === 'string') {
    return (original as string[]).join() !== (proposed as string[]).join();
  } else if ('teamName' in testVal) {
    return (
      (original as TeamPreview[]).map((team) => team.teamId).join() !==
      (proposed as TeamPreview[]).map((team) => team.teamId).join()
    );
  } else if ('id' in testVal) {
    return (
      (original as DescriptionBullet[]).map((bullet) => bullet.detail).join() !==
      (proposed as DescriptionBullet[]).map((bullet) => bullet.detail).join()
    );
  }
  return (original as Link[]).map((link) => link.url).join() !== (proposed as Link[]).map((link) => link.url).join();
};

export const projectToProposedChangesPreview = (project: Project | undefined): ProjectProposedChangesPreview | undefined => {
  if (!project) return undefined;

  return {
    name: project.name,
    summary: project.summary,
    lead: project.lead,
    manager: project.manager,
    teams: project.teams,
    budget: project.budget,
    descriptionBullets: project.descriptionBullets,
    links: project.links
  };
};

export const workPackageToProposedChangesPreview = (
  workPackage: WorkPackage | undefined
): WorkPackageProposedChangesPreview | undefined => {
  if (!workPackage) return undefined;

  return {
    name: workPackage.name,
    stage: workPackage.stage,
    lead: workPackage.lead,
    manager: workPackage.manager,
    startDate: workPackage.startDate,
    duration: workPackage.duration,
    blockedBy: workPackage.blockedBy,
    descriptionBullets: workPackage.descriptionBullets
  };
};

export const projectProposedChangesToPreview = (
  proposedChanges: ProjectProposedChanges | undefined
): ProjectProposedChangesPreview | undefined => {
  return (
    proposedChanges && {
      name: proposedChanges.name,
      summary: proposedChanges.summary,
      lead: proposedChanges.lead,
      manager: proposedChanges.manager,
      teams: proposedChanges.teams,
      budget: proposedChanges.budget,
      descriptionBullets: proposedChanges.descriptionBullets,
      links: proposedChanges.links
    }
  );
};

export const workPackageProposedChangesToPreview = (
  proposedChanges: WorkPackageProposedChanges | undefined
): WorkPackageProposedChangesPreview | undefined => {
  return (
    proposedChanges && {
      name: proposedChanges.name,
      stage: proposedChanges.stage,
      lead: proposedChanges.lead,
      manager: proposedChanges.manager,
      startDate: proposedChanges.startDate,
      duration: proposedChanges.duration,
      blockedBy: proposedChanges.blockedBy,
      descriptionBullets: proposedChanges.descriptionBullets
    }
  );
};
