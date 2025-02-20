import { Organization } from './user-types';
import { User } from './user-types';

export interface Sponsor {
  sponsorId: string;
  name: string;
  organizationId: string;
  organization: Organization;
  dateCreated: Date;
  dateDeleted?: Date;
  activeStatus: boolean;
  vendorContact: string;
  tier: SponsorTier;
  sponsorTierId: string;
  sponsorValue: number;
  joinDate: Date;
  discountCode?: string;
  activeYears: number[];
  taxExempt: boolean;
  sponsorTasks: Sponsor_Task[];
}

export interface SponsorTier {
  sponsorTierId: string;
  organization: Organization;
  organizationId: string;
  name: string;
  colorHexCode: string;
  sponsors: Sponsor[];
}

export interface Sponsor_Task {
  sponsorTaskId: string;
  dueDate: Date;
  notifyDate?: Date;
  assignee?: User;
  assigneeUserId?: string;
  notes: string;
  sponsor: Sponsor;
  sponsorId: string;
}
