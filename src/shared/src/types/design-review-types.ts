/*

Todo
1. Create the design review interface type with all the data from the model 
DONE---------------------------------------------------------------

2. In the design review transformer we need to return all the data thats defined in the model
Anything that could be null (meaning optional ?) in the db we use null coalescing and return undefined
Also if there is a relation on a data point we need to use the transformer for that data type see manfact transformer
3. For the query args for the design review for the relations that are like FK we need to include. Also for teamtype we will need to create the type and transformer :)

*/

import { WbsElement } from './project-types';
import { User } from './user-types';

export interface DesignReview {
  designReviewId: string;
  dateScheduled: Date;
  meetingTimes: number[];
  dateCreated: Date;
  userCreated: User;
  userCreatedId: number;
  status: DesignReviewStatus;
  teamType: TeamType;
  teamTypeId: string;
  requiredMembers: User[];
  optionalMembers: User[];
  confirmedMembers: User[];
  deniedMembers: User[];
  location?: string;
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink?: string;
  attendees: User[];
  dateDeleted?: Date;
  userDeleted?: User;
  userDeletedId?: number;
  docTemplateLink?: string;
  wbsElementId: number;
  wbsElement: WbsElement;
}

export enum DesignReviewStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE'
}

export interface TeamType {
  teamTypeId: string;
  name: string;
  designReviews: DesignReview[];
}
