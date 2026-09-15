import { Faker } from '@faker-js/faker';

export const arrayOrNull = <T>(faker: Faker, array: Array<T>, nullChance: number): T | null => {
  if (!faker.datatype.boolean({ probability: nullChance })) return null;
  return faker.helpers.arrayElement(array);
};
