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
