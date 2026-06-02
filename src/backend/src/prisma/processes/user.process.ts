import { Prisma, Theme } from '@prisma/client';
import { RoleEnum } from 'shared';
import { getUserQueryArgs } from '../../prisma-query-args/user.query-args.js';
import { SeedProcess } from './seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';

type FullUser = Prisma.UserGetPayload<ReturnType<typeof getUserQueryArgs>>;

const TOTAL_USERS = 350;

const ROLE_COUNTS = {
  [RoleEnum.GUEST]: Math.floor(TOTAL_USERS * 0.5),
  [RoleEnum.MEMBER]: Math.floor(TOTAL_USERS * 0.5 * 0.35),
  [RoleEnum.LEADERSHIP]: Math.floor(TOTAL_USERS * 0.5 * 0.1),
  [RoleEnum.HEAD]: Math.floor(TOTAL_USERS * 0.5 * 0.04),
  [RoleEnum.ADMIN]: Math.floor(TOTAL_USERS * 0.5 * 0.01),
  [RoleEnum.APP_ADMIN]: 2
} as const;

export const USER_COUNT = Object.values(ROLE_COUNTS).reduce((a, b) => a + b, 0);

export type UsersOutput = {
  appAdmins: FullUser[];
  admins: FullUser[];
  heads: FullUser[];
  leadership: FullUser[];
  members: FullUser[];
  guests: FullUser[];
  all: FullUser[];
};

export class UsersProcess extends SeedProcess<OrganizationOutput, UsersOutput> {
  dependencies() {
    return [OrganizationProcess];
  }

  async run({ organization }: OrganizationOutput): Promise<UsersOutput> {
    const { organizationId } = organization;

    const NEU_EMAIL_DOMAINS = ['husky.neu.edu', 'northeastern.edu'];

    const createEmailId = (firstName: string, lastName: string) => {
      // Temp hack for getting around duplicate names with faker.
      return `${lastName.toLowerCase()}.${firstName[0].toLowerCase()}.${this.faker.string.alphanumeric(6)}`;
    };

    const createBaseUser = async (role: RoleEnum): Promise<FullUser> => {
      const firstName = this.faker.person.firstName();
      const lastName = this.faker.person.lastName();
      const emailId = createEmailId(firstName, lastName);
      const domain = this.faker.helpers.arrayElement(NEU_EMAIL_DOMAINS);

      return this.prisma.user.create({
        data: {
          firstName,
          lastName,
          googleAuthId: this.faker.string.uuid(),
          email: `${emailId}@${domain}`,
          emailId,
          organizations: { connect: [{ organizationId }] },
          roles: { create: { roleType: role, organizationId } }
        },
        ...getUserQueryArgs(organizationId)
      });
    };

    const createGuest = async (): Promise<FullUser> => {
      const firstName = this.faker.person.firstName();
      const lastName = this.faker.person.lastName();
      const domain = this.faker.helpers.arrayElement(NEU_EMAIL_DOMAINS);
      const emailId = `${lastName.toLowerCase()}.${firstName[0].toLowerCase()}.${this.faker.string.alphanumeric(6)}`;

      return this.prisma.user.create({
        data: {
          firstName,
          lastName,
          googleAuthId: this.faker.string.uuid(),
          email: `${emailId}@${domain}`,
          organizations: { connect: [{ organizationId }] },
          roles: { create: { roleType: RoleEnum.GUEST, organizationId } }
        },
        ...getUserQueryArgs(organizationId)
      });
    };

    const createMemberLike = async (role: RoleEnum.MEMBER | RoleEnum.LEADERSHIP): Promise<FullUser> => {
      const firstName = this.faker.person.firstName();
      const lastName = this.faker.person.lastName();
      const emailId = createEmailId(firstName, lastName);
      const theme = this.faker.helpers.arrayElement([Theme.DARK, Theme.LIGHT]);
      const domain = this.faker.helpers.arrayElement(NEU_EMAIL_DOMAINS);

      return this.prisma.user.create({
        data: {
          firstName,
          lastName,
          googleAuthId: this.faker.string.uuid(),
          email: `${emailId}@${domain}`,
          emailId,
          userSettings: {
            create: {
              defaultTheme: theme,
              slackId: emailId
            }
          },
          userSecureSettings: {
            create: {
              nuid: this.faker.string.numeric(9),
              phoneNumber: this.faker.phone.number(),
              street: this.faker.location.streetAddress(),
              city: this.faker.location.city(),
              state: this.faker.location.state({ abbreviated: true }),
              zipcode: this.faker.location.zipCode()
            }
          },
          organizations: { connect: [{ organizationId }] },
          roles: { create: { roleType: role, organizationId } }
        },
        ...getUserQueryArgs(organizationId)
      });
    };

    const createMember = () => createMemberLike(RoleEnum.MEMBER);
    const createLead = () => createMemberLike(RoleEnum.LEADERSHIP);
    const createHead = (): Promise<FullUser> => createBaseUser(RoleEnum.HEAD);
    const createAdmin = (): Promise<FullUser> => createBaseUser(RoleEnum.ADMIN);
    const createAppAdmin = (): Promise<FullUser> => createBaseUser(RoleEnum.APP_ADMIN);

    const [appAdmins, admins, heads, leadership, members, guests] = await Promise.all([
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.APP_ADMIN] }, createAppAdmin)),
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.ADMIN] }, createAdmin)),
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.HEAD] }, createHead)),
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.LEADERSHIP] }, createLead)),
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.MEMBER] }, createMember)),
      Promise.all(Array.from({ length: ROLE_COUNTS[RoleEnum.GUEST] }, createGuest))
    ]);

    const all = [...appAdmins, ...admins, ...heads, ...leadership, ...members, ...guests];

    return { appAdmins, admins, heads, leadership, members, guests, all };
  }
}
