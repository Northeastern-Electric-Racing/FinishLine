import { User } from './user-types';

export interface Sponsor {
  sponsorId: string;
  name: string;
  activeStatus: boolean;
  vendorContact: string;
  tier: SponsorTier;
  sponsorValue: number;
  joinDate: Date;
  discountCode?: string;
  activeYears: number[];
  taxExempt: boolean;
  sponsorTasks: Sponsor_Task[];
}

export interface SponsorTier {
  sponsorTierId: string;
  name: string;
  colorHexCode: string;
  sponsors: Sponsor[];
}

export interface Sponsor_Task {
  sponsorTaskId: string;
  dueDate: Date;
  notifyDate?: Date;
  assignee?: User;
  notes: string;
  sponsor: Sponsor;
}
