import { User } from './user-types';

export interface Sponsor {
  sponsorId: string;
  name: string;
  activeStatus: boolean;
  vendorContact: string;
  tierId: string;
  sponsorValue: number;
  joinDate: Date;
  activeYears: number[];
  taxExempt: boolean;
  discountCode?: string;
  sponsorTasks: SponsorTask[];
  tier?: SponsorTier;
}

export interface SponsorTask {
  sponsorTaskId: string;
  dueDate: Date;
  notifyDate?: Date;
  assignee?: User;
  notes: string;
}

export interface SponsorTier {
  sponsorTierId: string;
  name: string;
  colorHexCode: string;
}
