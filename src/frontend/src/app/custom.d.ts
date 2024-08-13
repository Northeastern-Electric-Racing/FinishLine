import { OrganizationPreview } from "shared";

declare global {
   namespace Express {
     export interface Request {
       organization?: OrganizationPreview;
     }
   }
 }
  