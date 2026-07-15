import { Prisma, Theme } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { RoleEnum } from 'shared';

const NEU_EMAIL_DOMAINS = ['husky.neu.edu', 'northeastern.edu'];

const emailIdCreateInput = (faker: Faker, firstName: string, lastName: string) => {
  // Temp hack for getting around duplicate names with faker.
  return `${lastName.toLowerCase()}.${firstName[0].toLowerCase()}.${faker.string.alphanumeric(6)}`;
};

const baseUserFields = (faker: Faker, organizationId: string, role: RoleEnum): Prisma.UserCreateInput => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const emailId = emailIdCreateInput(faker, firstName, lastName);
  const domain = faker.helpers.arrayElement(NEU_EMAIL_DOMAINS);

  return {
    firstName,
    lastName,
    googleAuthId: faker.string.uuid(),
    email: `${emailId}@${domain}`,
    emailId,
    organizations: { connect: [{ organizationId }] },
    roles: { create: { roleType: role, organizationId } }
  };
};

export const guestCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const domain = faker.helpers.arrayElement(NEU_EMAIL_DOMAINS);
  const emailId = emailIdCreateInput(faker, firstName, lastName);

  return {
    firstName,
    lastName,
    googleAuthId: faker.string.uuid(),
    email: `${emailId}@${domain}`,
    organizations: { connect: [{ organizationId }] },
    roles: { create: { roleType: RoleEnum.GUEST, organizationId } }
  };
};

export const memberLikeCreateInput = (
  faker: Faker,
  organizationId: string,
  role: RoleEnum.MEMBER | RoleEnum.LEADERSHIP | RoleEnum.HEAD | RoleEnum.ADMIN | RoleEnum.APP_ADMIN
): Prisma.UserCreateInput => {
  const theme = faker.helpers.arrayElement([Theme.DARK, Theme.LIGHT]);

  return {
    ...baseUserFields(faker, organizationId, role),
    userSettings: {
      create: {
        defaultTheme: theme,
        slackId: faker.string.alphanumeric(6)
      }
    },
    userSecureSettings: {
      create: {
        nuid: `002${faker.string.numeric(6)}`,
        phoneNumber: faker.phone.number(),
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipcode: faker.location.zipCode()
      }
    }
  };
};

export const memberCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput =>
  memberLikeCreateInput(faker, organizationId, RoleEnum.MEMBER);

export const leadCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput =>
  memberLikeCreateInput(faker, organizationId, RoleEnum.LEADERSHIP);

export const headCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput =>
  memberLikeCreateInput(faker, organizationId, RoleEnum.HEAD);

export const adminCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput =>
  memberLikeCreateInput(faker, organizationId, RoleEnum.ADMIN);

export const appAdminCreateInput = (faker: Faker, organizationId: string): Prisma.UserCreateInput =>
  memberLikeCreateInput(faker, organizationId, RoleEnum.APP_ADMIN);
