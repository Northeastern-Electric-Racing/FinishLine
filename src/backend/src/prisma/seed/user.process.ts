import { Prisma, Role } from '@prisma/client';
import { RoleEnum } from 'shared';
import { getUserQueryArgs } from '../../prisma-query-args/user.query-args.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import {
  adminCreateInput,
  guestCreateInput,
  headCreateInput,
  leadCreateInput,
  memberCreateInput
} from '../factories/user.factory.js';
import { SeedProcess } from '../processes/seed-process.js';
import type { FullUser } from '../context.js';
import { seedConfig } from '../seed-config.js';

const { totalUsers, roleDistribution } = seedConfig.user;

const BOOTSTRAP_APP_ADMINS = 1;

const GUEST_COUNT = Math.round(totalUsers * roleDistribution.guest);
const MEMBER_COUNT = Math.round(totalUsers * roleDistribution.member);
const LEADERSHIP_COUNT = Math.round(totalUsers * roleDistribution.leadership);
const HEAD_COUNT = Math.round(totalUsers * roleDistribution.head);

const ROLE_COUNTS = {
  [RoleEnum.GUEST]: GUEST_COUNT,
  [RoleEnum.MEMBER]: MEMBER_COUNT,
  [RoleEnum.LEADERSHIP]: LEADERSHIP_COUNT,
  [RoleEnum.HEAD]: HEAD_COUNT,
  [RoleEnum.ADMIN]: totalUsers - BOOTSTRAP_APP_ADMINS - GUEST_COUNT - MEMBER_COUNT - LEADERSHIP_COUNT - HEAD_COUNT,
  [RoleEnum.APP_ADMIN]: 0
} as const;

export const USER_COUNT = BOOTSTRAP_APP_ADMINS + Object.values(ROLE_COUNTS).reduce((a, b) => a + b, 0);

export type UsersOutput = {
  appAdmins: FullUser[];
  admins: FullUser[];
  heads: FullUser[];
  leadership: FullUser[];
  members: FullUser[];
  guests: FullUser[];
  all: FullUser[];
  roles: Role[];
  rolesByType: Record<RoleEnum, Role[]>;
};

export class UsersProcess extends SeedProcess<OrganizationOutput, UsersOutput> {
  dependencies() {
    return [OrganizationProcess];
  }

  async run({ organization, bootstrapUserId }: OrganizationOutput): Promise<UsersOutput> {
    const { organizationId } = organization;

    const createUser = (input: Prisma.UserCreateInput): Promise<FullUser> =>
      this.prisma.user.create({
        data: input,
        ...getUserQueryArgs(organizationId)
      });

    const bootstrapAppAdmin = await this.prisma.user.findUniqueOrThrow({
      where: { userId: bootstrapUserId },
      ...getUserQueryArgs(organizationId)
    });

    const [admins, heads, leadership, members, guests] = await Promise.all([
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

    const appAdmins = [bootstrapAppAdmin];
    const all = [...appAdmins, ...admins, ...heads, ...leadership, ...members, ...guests];
    const roles = all.flatMap((user) => user.roles);

    const rolesByType = {
      [RoleEnum.APP_ADMIN]: roles.filter((role) => role.roleType === RoleEnum.APP_ADMIN),
      [RoleEnum.ADMIN]: roles.filter((role) => role.roleType === RoleEnum.ADMIN),
      [RoleEnum.HEAD]: roles.filter((role) => role.roleType === RoleEnum.HEAD),
      [RoleEnum.LEADERSHIP]: roles.filter((role) => role.roleType === RoleEnum.LEADERSHIP),
      [RoleEnum.MEMBER]: roles.filter((role) => role.roleType === RoleEnum.MEMBER),
      [RoleEnum.GUEST]: roles.filter((role) => role.roleType === RoleEnum.GUEST)
    };

    return { appAdmins, admins, heads, leadership, members, guests, all, roles, rolesByType };
  }
}
