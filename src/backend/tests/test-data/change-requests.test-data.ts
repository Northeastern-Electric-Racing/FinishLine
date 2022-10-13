import { CR_Type } from '@prisma/client';

export const changeBatmobile = {
  crId: 1,
  submitterId: 1,
  wbsElementId: 65,
  type: CR_Type.DEFINITION_CHANGE,
  changes: [
    {
      changeRequestId: 1,
      implementerId: 1,
      wbsElementId: 65,
      detail: 'changed batmobile from white (yuck) to black'
    }
  ],
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'white sucks'
};
