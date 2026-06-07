import { Organization, Prisma, Role } from '@prisma/client';
import { RoleEnum } from 'shared';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';

// Organization Context
export type OrganizationContext = {
  organization: Organization;
  bootstrapUserId: string;
};

// User Context
export type FullUser = Prisma.UserGetPayload<ReturnType<typeof getUserQueryArgs>>;

export type UsersContext = {
  appAdmins: FullUser[];
  admins: FullUser[];
  heads: FullUser[];
  leadership: FullUser[];
  members: FullUser[];
  guests: FullUser[];
  all: FullUser[];
};

// Role Context
export type RoleContext = {
  roles: Role[];
  rolesByType: Record<RoleEnum, Role[]>;
};

// Main Seed Context
export type SeedContext = OrganizationContext & UsersContext & RoleContext;

// Car Context
export type DateRange = {
  start: Date;
  end: Date;
};

export type CarContext = {
  car: Prisma.CarGetPayload<{ include: { wbsElement: true } }>;
  year: number;
  dateRange: DateRange;
};

export type CarOutput = {
  cars: CarContext[];
  currentYearCar: CarContext;
};
