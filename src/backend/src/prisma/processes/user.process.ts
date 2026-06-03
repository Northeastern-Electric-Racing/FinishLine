import { Prisma, Theme } from '@prisma/client';
import { RoleEnum } from 'shared';
import { getUserQueryArgs } from '../../prisma-query-args/user.query-args.js';
import { SeedProcess } from './seed-process.js';
import { OrganizationProcess } from './organization.process.js';

type FullUser = Prisma.UserGetPayload<ReturnType<typeof getUserQueryArgs>>;

const ROLE_COUNTS = {
  [RoleEnum.APP_ADMIN]: 2,
  [RoleEnum.ADMIN]: 2,
  [RoleEnum.HEAD]: 1,
  [RoleEnum.LEADERSHIP]: 80,
  [RoleEnum.MEMBER]: 10,
  [RoleEnum.GUEST]: 1
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

export class UsersProcess extends SeedProcess<{}, UsersOutput> {
  private organizationId: string;

  constructor(organizationId: string) {
    super();
    this.organizationId = organizationId;
  }

 dependencies() {
    return [OrganizationProcess];
  }

  async run(_deps: {}): Promise<UsersOutput> {
    const { organizationId } = this;

    const createUser = async (role: RoleEnum): Promise<FullUser> => {
      const firstName = this.faker.person.firstName();
      const lastName = this.faker.person.lastName();
      const emailId = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}`;
      const theme = this.faker.helpers.arrayElement([Theme.DARK, Theme.LIGHT]);

      return this.prisma.user.create({
        data: {
          firstName,
          lastName,
          googleAuthId: this.faker.string.uuid(),
          email: this.faker.internet.email({ firstName, lastName }),
          emailId,
          userSettings: {
            create: {
              defaultTheme: theme,
              slackId: emailId
            }
          },
          organizations: { connect: [{ organizationId }] },
          roles: { create: { roleType: role, organizationId } }
        },
        ...getUserQueryArgs(organizationId)
      });
    };

    const createMany = (role: RoleEnum, count: number) => Promise.all(Array.from({ length: count }, () => createUser(role)));

    const [appAdmins, admins, heads, leadership, members, guests] = await Promise.all([
      createMany(RoleEnum.APP_ADMIN, ROLE_COUNTS[RoleEnum.APP_ADMIN]),
      createMany(RoleEnum.ADMIN, ROLE_COUNTS[RoleEnum.ADMIN]),
      createMany(RoleEnum.HEAD, ROLE_COUNTS[RoleEnum.HEAD]),
      createMany(RoleEnum.LEADERSHIP, ROLE_COUNTS[RoleEnum.LEADERSHIP]),
      createMany(RoleEnum.MEMBER, ROLE_COUNTS[RoleEnum.MEMBER]),
      createMany(RoleEnum.GUEST, ROLE_COUNTS[RoleEnum.GUEST])
    ]);

    const all = [...appAdmins, ...admins, ...heads, ...leadership, ...members, ...guests];

    return { appAdmins, admins, heads, leadership, members, guests, all };
  }
}
