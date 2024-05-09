import {
  DescriptionBullet,
  LinkInfo,
  TeamPreview,
  User,
  WbsElementStatus,
  WbsNumber,
  WorkPackageStage,
  wbsPipe
} from 'shared';
import { datePipe, displayEnum, fullNamePipe } from './pipes';

export interface ChangeBullet {
  label: string;
  detail: string | number | string[] | User | TeamPreview[] | DescriptionBullet[] | LinkInfo[] | Date | WbsNumber[];
}

export const changeBulletDetailText = (changeBullet: ChangeBullet): string | string[] => {
  const { detail } = changeBullet;
  if (detail === undefined) return '';
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
    return detail.toString();
  } else if ('firstName' in detail) {
    return fullNamePipe(detail);
  } else if (detail.length === 0) {
    return '';
  } else {
    // detail is a non-empty array
    const testVal = detail[0];

    if (typeof testVal === 'string') {
      return detail as string[];
    } else if ('teamName' in testVal) {
      return (detail as TeamPreview[]).map((team) => team.teamName);
    } else if ('id' in testVal) {
      return (detail as DescriptionBullet[]).map((bullet) => bullet.detail);
    } else if ('carNumber' in testVal) {
      return (detail as WbsNumber[]).map(wbsPipe);
    } else {
      return (detail as LinkInfo[]).map((link) => link.linkType.name);
    }
  }
};

export enum PotentialChangeType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  SAME = 'SAME'
}

export const potentialChangeBackgroundMap: Map<PotentialChangeType, string> = new Map([
  [PotentialChangeType.ADDED, '#51915c'],
  [PotentialChangeType.REMOVED, '#8a4e4e']
]);

export const potentialChangeHighlightMap: Map<PotentialChangeType, string> = new Map([
  [PotentialChangeType.ADDED, '#43a854'],
  [PotentialChangeType.REMOVED, '#ba5050']
]);
