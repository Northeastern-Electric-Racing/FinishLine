import { User } from './user-types.js';

export enum ProspectiveSponsorStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DECLINED = 'DECLINED',
  NOT_IN_CONTACT = 'NOT_IN_CONTACT',
  NO_RESPONSE = 'NO_RESPONSE',
  ACCEPTED = 'ACCEPTED'
}

export enum FirstContactMethod {
  INBOUND_FORM = 'INBOUND_FORM',
  INBOUND_EMAIL = 'INBOUND_EMAIL',
  OUTBOUND_EMAIL = 'OUTBOUND_EMAIL',
  OTHER = 'OTHER'
}

export enum SponsorValueType {
  MONETARY = 'MONETARY',
  STOCK = 'STOCK',
  DISCOUNT = 'DISCOUNT'
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface Sponsor {
  sponsorId: string;
  name: string;
  activeStatus: boolean;
  contact: ContactInfo;
  valueTypes: SponsorValueType[];
  sponsorValue?: number;
  stockDescription?: string;
  discountDescription?: string;
  joinDate: Date;
  activeYears: number[];
  taxExempt: boolean;
  discountCode?: string;
  sponsorNotes?: string;
  sponsorTasks: SponsorTask[];
  tier?: SponsorTier;
}

export interface SponsorTask {
  sponsorTaskId: string;
  dueDate: Date;
  notifyDate?: Date;
  assignee?: User;
  notes: string;
  done: boolean;
}

export interface SponsorTier {
  sponsorTierId: string;
  name: string;
  colorHexCode: string;
  minSupportValue: number;
}

export interface ProspectiveSponsor {
  prospectiveSponsorId: string;
  organizationName: string;
  dateCreated: Date;
  lastContactDate?: Date;
  highlightThresholdDays: number;
  status: ProspectiveSponsorStatus;
  firstContactMethod?: FirstContactMethod;
  contactor?: User;
  contact?: ContactInfo;
  notes?: string;
  tasks: SponsorTask[];
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
  sponsorTaskId?: string;
  dueDate: Date;
  notifyDate?: Date;
  assigneeUserId?: string;
  notes: string;
  done?: boolean;
}
