import { User } from './user-types';

export interface Sponsor {
  sponsorId: string;
  name: string;
  activeStatus: boolean;
  vendorContact: string;
  sponsorValue: number;
  joinDate: Date;
  activeYears: number[];
  taxExempt: boolean;
  discountCode?: string;
  sponsorTasks: SponsorTask[];
  tier: SponsorTier;
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
  minSupportValue: number;
}

export interface SpendingBarData {
  title: string;
  data: {
    title: string;
    spendingInfo: ReimbursementRequestData;
  }[];
}

export interface ReimbursementRequestData {
  totalBudget: number;
  pendingFinance: number;
  pendingLeadership: number;
  submittedToSabo: number;
  reimbursed: number;
  available: number;
}

export interface CreateSponsorTask {
  dueDate: Date;
  notifyDate?: Date;
  assigneeUserId?: string;
  notes: string;
}
