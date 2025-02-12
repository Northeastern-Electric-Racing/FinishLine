import { Organization } from './user-types';

export interface PartTagReviewType {
  partTagId: string;
  name: string;
  colorHexCode: string;
  dateCreated: Date;
  parts: String[];
  organization?: Organization;
  organizationId: string;
}
