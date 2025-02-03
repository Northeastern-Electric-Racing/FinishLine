import { Organization } from "./user-types";

export interface PartTagReviewType {
    partTagId: string;
    name: string;
    colorHexCode: string;
    dateCreated: Date;
    dateDeleted?: Date;
    parts: [];
    organization?: Organization;
    organizationId: string;
}