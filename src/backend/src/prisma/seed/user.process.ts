import { Prisma } from '@prisma/client';
import { RoleEnum } from 'shared';
import { getUserQueryArgs } from '../../prisma-query-args/user.query-args.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import {
  adminCreateInput,
  appAdminCreateInput,
  guestCreateInput,
  headCreateInput,
  leadCreateInput,
  memberCreateInput
} from '../factories/user.factory.js';
import { SeedProcess } from '../processes/seed-process.js';

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

    const createUser = (input: Prisma.UserCreateInput): Promise<FullUser> =>
      this.prisma.user.create({
        data: input,
        ...getUserQueryArgs(organizationId)
      });

    const [appAdmins, admins, heads, leadership, members, guests] = await Promise.all([
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.APP_ADMIN] }, () =>
          createUser(appAdminCreateInput(this.faker, organizationId))
        )
      ),
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.ADMIN] }, () => createUser(adminCreateInput(this.faker, organizationId)))
      ),
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.HEAD] }, () => createUser(headCreateInput(this.faker, organizationId)))
      ),
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.LEADERSHIP] }, () =>
          createUser(leadCreateInput(this.faker, organizationId))
        )
      ),
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.MEMBER] }, () => createUser(memberCreateInput(this.faker, organizationId)))
      ),
      Promise.all(
        Array.from({ length: ROLE_COUNTS[RoleEnum.GUEST] }, () => createUser(guestCreateInput(this.faker, organizationId)))
      )
    ]);

    const all = [...appAdmins, ...admins, ...heads, ...leadership, ...members, ...guests];

    return { appAdmins, admins, heads, leadership, members, guests, all };
  }
}
