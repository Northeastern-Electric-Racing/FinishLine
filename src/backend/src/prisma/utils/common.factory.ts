import { Faker } from '@faker-js/faker';

export const connectUser = (userId: string) => ({ connect: { userId } });
export const connectOrganization = (organizationId: string) => ({ connect: { organizationId } });

export const randomElementWithBlacklist = <T>(faker: Faker, elements: Array<T>, blacklistedElements: Array<T>): T => {
  const whitelistedElements = elements.filter((v) => !blacklistedElements.includes(v));
  return faker.helpers.arrayElement(whitelistedElements);
};
