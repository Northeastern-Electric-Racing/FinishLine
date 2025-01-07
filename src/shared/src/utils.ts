import { WbsNumber } from './types/project-types';
import { wbsPipe } from './validate-wbs';

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
export const wbsNamePipe = (wbsElement: { wbsNum: WbsNumber; name: string }) => {
  return `${wbsPipe(wbsElement.wbsNum)} - ${wbsElement.name}`;
};

export const isSubset = (elements: string[], suppliedArray: string[]): boolean => {
  return elements.every((element) => suppliedArray.includes(element));
};

export const meetingStartTimePipe = (times: number[]) => {
  const time = (times[0] % 12) + 10;

  return time <= 12 ? time + 'am' : time - 12 + 'pm';
};
