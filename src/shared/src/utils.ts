import { WbsNumber } from './types/project-types.js';
import { wbsPipe } from './validate-wbs.js';

export const deeplyCopy = <T>(obj: T | T[], transformer: (obj: T) => T = (obj) => obj): T | T[] => {
  if (Array.isArray(obj)) {
    return deeplyCopyArray(obj, transformer) as T[];
  }
  return deeplyCopyObj(obj, transformer);
};

const deeplyCopyArray = <T>(arr: T[], transformer: (obj: T) => T = (obj) => obj): T[] => {
  return JSON.parse(JSON.stringify(arr)).map(transformer);
};

const deeplyCopyObj = <T>(obj: T, transformer: (obj: T) => T = (obj) => obj): T => {
  return transformer(JSON.parse(JSON.stringify(obj)));
};

/** Display WBS number as string "1.2.0 - Project Name" */
export const wbsNamePipe = (wbsElement: { wbsNum: WbsNumber; name: string; projectName?: string }) => {
  return `${wbsPipe(wbsElement.wbsNum)} - ${wbsElement.projectName ? wbsElement.projectName + ' - ' : ''} ${wbsElement.name}`;
};

export const isSubset = (elements: string[], suppliedArray: string[]): boolean => {
  return elements.every((element) => suppliedArray.includes(element));
};

export const meetingStartTimePipeNumbers = (hours: number[]) => {
  const [hour] = hours;
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11
  return displayHour + (hour < 12 ? 'am' : 'pm');
};

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
