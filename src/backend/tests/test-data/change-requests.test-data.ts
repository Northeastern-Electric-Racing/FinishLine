import {
  Change_Request as PrismaChangeRequest,
  Proposed_Solution as PrismaProposedSolution,
  Scope_CR_Why as PrismaScopeCRWhy,
  Scope_CR as PrismaScopeCR,
  Work_Package as PrismaWorkPackage,
  Description_Bullet as PrismaDescriptionBullet,
  WBS_Element as PrismaWBSElement,
  WBS_Element_Status as PrismaWBSElementStatus,
  Change as PrismaChange,
  Stage_Gate_CR as PrismaStageGateCR,
  CR_Type as PrismaCRType,
  Scope_CR_Why_Type as PrismaScopeCRWhyType
} from '@prisma/client';


export const changeBatmobileChange: PrismaChange = {
  changeId: 3,
  dateImplemented: new Date('11/26/2020'),
  changeRequestId: 1,
  implementerId: 1,
  wbsElementId: 65,
  detail: 'changed batmobile from white (yuck) to black'
}

export const changeBatmobile: PrismaChangeRequest = {
  crId: 1,
  submitterId: 1,
  wbsElementId: 65,
  type: PrismaCRType.DEFINITION_CHANGE,
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'white sucks'
};

export const solutionToRedesignWhip : PrismaProposedSolution = {
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
export const redesignWhipWhy: PrismaScopeCRWhy = {
  scopeCrWhyId: 1,
  scopeCrId: 1,
  type: PrismaScopeCRWhyType.DESIGN,
  explain: 'because it looks better'
};
export const redesignWhipScopeCR : PrismaScopeCR = {
  scopeCrId: 1,
  changeRequestId: 2,
  what: 'redesign whip',
  //why: redesignWhipWhy,
  scopeImpact: 'huge',
  timelineImpact: 10,
  budgetImpact: 1000,
};

export const whipExpectedActivites: PrismaDescriptionBullet = 
  {
    descriptionId: 1,
    dateAdded: new Date('10/10/2022'),
    userCheckedId: 1,
    dateTimeChecked: new Date('10/10/2022'),
    dateDeleted: null,
    projectIdGoals: null,
    projectIdFeatures: null,
    projectIdOtherConstraints: null,
    workPackageIdDeliverables: null,
    detail: 'redesign whip',
    workPackageIdExpectedActivities: 1
  };
export const whipDeliverables: PrismaDescriptionBullet = 
  {
    descriptionId: 2,
    dateAdded: new Date('10/10/2022'),
    userCheckedId: 1,
    dateTimeChecked: new Date('10/10/2022'),
    detail: 'Gotta Finish',
    workPackageIdDeliverables: 1,
    projectIdGoals: null,
    projectIdFeatures: null,
    projectIdOtherConstraints: null,
    workPackageIdExpectedActivities: null,
    dateDeleted: null  
  };

export const whipWorkPackage : PrismaWorkPackage = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10
};

export const redesignWhipWBSElement : PrismaWBSElement = {
  wbsElementId: 65,
  dateCreated: new Date('10/18/2022'),
  carNumber: 1,
  projectNumber: 1,
  workPackageNumber: 1,
  name: 'redesign whip',
  status: PrismaWBSElementStatus.ACTIVE,
  projectLeadId: 1,
  projectManagerId: 2,
};

export const redesignWhipChange : PrismaChange = {
  changeId: 1,
  changeRequestId: 2,
  implementerId: 3,
  dateImplemented: new Date('10/18/2022'),
  wbsElementId: 65,
  detail: 'changed whip from orange (yuck) to Red'
}
export const redesignWhip : PrismaChangeRequest= {
  crId: 2,
  submitterId: 1,
  wbsElementId: 65,
  type: PrismaCRType.OTHER,
  dateSubmitted: new Date('10/10/2022'),
  dateReviewed: new Date('10/18/2022'),
  accepted: true,
  reviewerId: 2,
  reviewNotes: 'orange sucks',
};
export const redesignWhipStageGate : PrismaStageGateCR = {
  stageGateCrId: 1,
  changeRequestId: 2,
  leftoverBudget: 1000,
  confirmDone: true
};


export const unreviewedCrChange: PrismaChange = {
  changeId: 2,
  changeRequestId: 1,
  implementerId: 1,
  dateImplemented: new Date('11/24/2020'),
  wbsElementId: 65,
  detail: "this won't get reviewed"
};
export const unreviewedCr : PrismaChangeRequest= {
  crId: 69,
  submitterId: 1,
  wbsElementId: 65,
  type: PrismaCRType.DEFINITION_CHANGE,
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: null,
  accepted: null,
  reviewerId: null,
  reviewNotes: null
};

export const reviewChangeRequestParams = {
  crId: 2,
  reviewNotes: 'reviewNotes',
  accepted: true
};
