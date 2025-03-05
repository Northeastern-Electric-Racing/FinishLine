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
  sponsorTasks: SponsorTask[];
}

export interface SponsorTier {
  sponsorTierId: string;
  name: string;
  colorHexCode: string;
  sponsors: Sponsor[];
}

export interface SponsorTask {
  sponsorTaskId: string;
  dueDate: Date;
  notifyDate?: Date;
  assignee?: User;
  notes: string;
  sponsor: Sponsor;
}
