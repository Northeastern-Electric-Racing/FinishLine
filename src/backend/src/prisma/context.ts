import {
  Account_Code,
  Car,
  Description_Bullet_Type,
  Index_Code,
  Link_Type,
  Manufacturer,
  Material_Type,
  Organization,
  Prisma,
  Project,
  Reimbursement_Product_Other_Reason,
  Role,
  Team_Type,
  Team,
  Unit,
  Vendor,
  WBS_Element
} from '@prisma/client';
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

// Config Data Context
export type ConfigDataContext = {
  teamTypes: Team_Type[];
  linkTypes: Link_Type[];
  descriptionBulletTypes: Description_Bullet_Type[];
  materialTypes: Material_Type[];
  manufacturers: Manufacturer[];
  units: Unit[];
  accountCodes: Account_Code[];
  indexCodes: Index_Code[];
  vendors: Vendor[];
  reimbursementProductOtherReasons: Reimbursement_Product_Other_Reason[];
};

// Main Seed Context
export type SeedContext = OrganizationContext & UsersContext & RoleContext & CarOutput & ConfigDataContext;

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

export type ProjectContext = {
  project: Project & {
    wbsElement: WBS_Element;
    teams: Team[];
    car: Car;
  };
  timeline: DateRange;
};
