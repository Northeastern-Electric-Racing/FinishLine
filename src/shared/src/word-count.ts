/**
 * Counts the amount of words in a string
 * @param str - the string to count words in
 * @returns - the number of words in the string
 */
export const countWords = (str: string): number => {
  return str.split(/\s/).filter((word) => word.trim() !== '').length;
};

/**
 * Checks if the given string is under the given word count
 * @param str - the string to check the word count of
 * @param limit - the limit to check against
 * @returns if the amount of words in the string is less than the given limit
 */
export const isUnderWordCount = (str: string, limit: number): boolean => {
  return countWords(str) < limit;
};
