import { Faker } from '@faker-js/faker';

export const connectUser = (userId: string) => ({ connect: { userId } });
export const connectOrganization = (organizationId: string) => ({ connect: { organizationId } });

export const randomElementWithBlacklist = <T>(faker: Faker, elements: T[], blacklistedElements: T[]): T => {
  if (elements.length === 0) throw new Error('randomElementWithBlacklist requires a non-empty elements array');

  const whitelistedElements = elements.filter((v) => !blacklistedElements.includes(v));
  const pool = whitelistedElements.length > 0 ? whitelistedElements : elements;

  return faker.helpers.arrayElement(pool);
};
