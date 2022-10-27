import { CR_Type, Scope_CR_Why_Type } from '@prisma/client';
import { WBS_Element_Status } from '@prisma/client';

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

export const solutionToRedesignWhip = {
  proposedSolutionId: '1',
  description: 'Change Color from Orange to Black',
  timelineImpact: 10,
  budgetImpact: 1000,
  scopeImpact: 'huge',
  changeRequestId: 1,
  createdByUserId: 3,
  dateCreated: new Date('10/16/2022'),
  approved: false
};
export const redesignWhipWhy = {
  scopeCRWhyId: 1,
  scopeCrId: 1,
  type: Scope_CR_Why_Type.DESIGN,
  explain: 'because it looks better'
};
export const redesignWhipScopeCR = {
  scopeCrId: 1,
  changeRequestId: 2,
  what: 'redesign whip',
  why: redesignWhipWhy,
  scopeImpact: 'huge',
  timelineImpact: 10,
  budgetImpact: 1000,
  proposedSolutions: solutionToRedesignWhip
};

export const redesignWhip = {
  crId: 2,
  submitterId: 100,
  wbsElementId: 65,
  projectId: 2,
  type: CR_Type.OTHER,
  dateSubmitted: new Date('10/10/2022'),
  dateReviewed: new Date('10/18/2022'),
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'orange sucks',
  changes: [
    {
      changeRequestId: 2,
      implementerId: 3,
      wbsElementId: 65,
      detail: 'changed whip from orange (yuck) to Red'
    }
  ],
  scopeChangeRequest: redesignWhipScopeCR
};
export const whipWorkPackage = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  progress: 20,
  duration: 10
};

export const redesignWhipWBSElement = {
  wbsElementId: 65,
  dateCreated: new Date('10/18/2022'),
  carNumber: 1,
  projectNumber: 1,
  workPackageNumber: 1,
  name: 'redesign whip',
  status: WBS_Element_Status.ACTIVE,
  projectLeadId: 1,
  projectManagerId: 2,
  changeRequests: [redesignWhip],
  workPackage: whipWorkPackage
};

export const unreviewedCr = {
  crId: 69,
  submitterId: 1,
  wbsElementId: 65,
  type: CR_Type.DEFINITION_CHANGE,
  changes: [
    {
      changeRequestId: 1,
      implementerId: 1,
      wbsElementId: 65,
      detail: "this won't get reviewed"
    }
  ],
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: null,
  accepted: null,
  reviewerId: null,
  reviewNotes: null
};
