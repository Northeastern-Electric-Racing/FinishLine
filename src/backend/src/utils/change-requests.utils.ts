import prisma from '../prisma/prisma.js';
import {
  Prisma,
  Change_Request,
  Change,
  Link_Type,
  Description_Bullet_Type,
  Project,
  Work_Package,
  WBS_Element,
  Organization
} from '@prisma/client';
import {
  DescriptionBulletPreview,
  formatDateOnly,
  LinkCreateArgs,
  ProjectProposedChangesCreateArgs,
  WbsNumber,
  wbsPipe,
  WorkPackageProposedChangesCreateArgs,
  WorkPackageStage,
  User
} from 'shared';
import { DeletedException, HttpException, NotFoundException } from './errors.utils.js';
import { ChangeRequestStatus } from 'shared';
import {
  ChangeRequestManyQueryArgs,
  ChangeRequestQueryArgs,
  ProjectProposedChangesQueryArgs,
  WbsProposedChangeQueryArgs,
  WorkPackageProposedChangesQueryArgs
} from '../prisma-query-args/change-requests.query-args.js';
import ProjectsService from '../services/projects.services.js';
import WorkPackagesService from '../services/work-packages.services.js';
import { descriptionBulletToDescriptionBulletPreview } from './description-bullets.utils.js';
import { sendSlackCRReviewedNotification } from './slack.utils.js';
import { validateBlockedBys } from './work-packages.utils.js';

/** Makes sure that a change request has been accepted already (and not deleted)
 * @param crId - the id of the change request to check
 * @returns the change request
 * @throws if the change request is unreviewed, denied, or deleted
 */
export const validateChangeRequestAccepted = async (crId: string) => {
  const changeRequest = await prisma.change_Request.findUnique({ where: { crId }, include: { changes: true } });
  const currentDate = new Date();

  if (!changeRequest) throw new NotFoundException('Change Request', crId);
  if (changeRequest.dateDeleted) throw new HttpException(400, 'Cannot use a deleted change request!');
  if (changeRequest.accepted === null) throw new HttpException(400, 'Cannot implement an unreviewed change request');
  if (!changeRequest.accepted) throw new HttpException(400, 'Cannot implement a denied change request');
  const dateImplemented = getDateImplemented(changeRequest);
  if (!dateImplemented && !changeRequest.dateReviewed)
    throw new HttpException(400, 'Cannot use an unreviewed and unimplemented change request');
  if (dateImplemented && currentDate.getTime() - dateImplemented.getTime() > 1000 * 60 * 60 * 24 * 5)
    throw new HttpException(400, 'Cannot tie changes to outdated change request');

  return changeRequest;
};

/**
 * Calculates the status of a change request.
 * @param changeRequest: is the change request payload
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
export const calculateChangeRequestStatus = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestManyQueryArgs>
): ChangeRequestStatus => {
  if (changeRequest.changes.length) {
    return ChangeRequestStatus.Implemented;
  } else if (changeRequest.accepted && changeRequest.dateReviewed) {
    return ChangeRequestStatus.Accepted;
  } else if (changeRequest.dateReviewed) {
    return ChangeRequestStatus.Denied;
  }
  return ChangeRequestStatus.Open;
};

export const getDateImplemented = (changeRequest: Change_Request & { changes: Change[] }): Date | undefined => {
  return changeRequest.changes.reduce(
    (res: Date | undefined, change) =>
      !res || change.dateImplemented.valueOf() < res.valueOf() ? change.dateImplemented : res,
    undefined
  );
};

/**
 * Determines whether all the change requests in an array of change requests have been reviewed or implemented
 * @param changeRequests the given array of change requests
 * @returns true if all the change requests have been reviewed, and false otherwise
 */
export const allChangeRequestsReviewed = (changeRequests: (Change_Request & { changes: Change[] })[]) => {
  return changeRequests.every((changeRequest) => changeRequest.dateReviewed || getDateImplemented(changeRequest));
};

export interface ProposedChangedValidationResult<T> {
  originalElement: T;
  links: (LinkCreateArgs & { linkType: Link_Type })[];
  descriptionBullets: (DescriptionBulletPreview & { descriptionBulletType: Description_Bullet_Type })[];
  validatedBlockedBys: WBS_Element[];
  carId?: string;
  workPackageProposedChanges: ProposedChangedValidationResult<WorkPackageProposedChangesCreateArgs>[];
}

/**
 * Determines if the project lead, project manager, and links all exist
 * @param name the name of the wbs element
 * @param links the links to be verified
 * @param descriptionBullets the description bullets to be verified
 * @param workPackageProposedChanges the work package proposed changes to be verified
 * @param organizationId the organization id the current user is in
 * @param carNumber the car number of the change request's WBS element
 * @param leadId the lead id to be verified
 * @param managerId the manager id to be verified
 */
export const validateProposedChangesFields = async <T>(
  originalElement: T,
  links: LinkCreateArgs[],
  descriptionBullets: DescriptionBulletPreview[],
  blockedBy: WbsNumber[],
  workPackageProposedChanges: WorkPackageProposedChangesCreateArgs[],
  organizationId: string,
  carNumber?: number,
  leadId?: string,
  managerId?: string
): Promise<ProposedChangedValidationResult<T>> => {
  if (leadId) {
    const lead = await prisma.user.findUnique({ where: { userId: leadId }, include: { organizations: true } });
    if (!lead) throw new NotFoundException('User', leadId);
    if (!lead.organizations.map((org) => org.organizationId).includes(organizationId))
      throw new HttpException(400, 'Project lead does not belong to the organization');
  }

  if (managerId) {
    const manager = await prisma.user.findUnique({
      where: { userId: managerId },
      include: { organizations: true }
    });
    if (!manager) throw new NotFoundException('User', managerId);
    if (!manager.organizations.map((org) => org.organizationId).includes(organizationId))
      throw new HttpException(400, 'Project manager does not belong to the organization');
  }

  const linksWithLinkTypes = links.map(async (link) => {
    const linkType = await prisma.link_Type.findUnique({
      where: { uniqueLinkType: { name: link.linkTypeName, organizationId } }
    });
    if (!linkType) throw new NotFoundException('Link Type', link.linkTypeName);
    return {
      ...link,
      linkType
    };
  });

  const descriptionBulletsWithTypes = descriptionBullets.map(async (bullet) => {
    const descriptionBulletType = await prisma.description_Bullet_Type.findUnique({
      where: { uniqueDescriptionBulletType: { name: bullet.type, organizationId } }
    });
    if (!descriptionBulletType) throw new NotFoundException('Description Bullet Type', bullet.type);
    return {
      ...bullet,
      descriptionBulletType
    };
  });

  let foundCarId = undefined;
  // Car number could be zero and a truthy check would fail
  if (carNumber !== undefined) {
    const carWbs = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber: 0,
          workPackageNumber: 0,
          organizationId
        }
      },
      include: {
        car: true
      }
    });
    if (!carWbs?.car) throw new NotFoundException('Car', carNumber);
    foundCarId = carWbs.car.carId;
  }

  const promises = workPackageProposedChanges.map(async (proposedChange) => {
    return await validateProposedChangesFields(
      proposedChange,
      [],
      proposedChange.descriptionBullets,
      proposedChange.blockedBy,
      [],
      organizationId,
      carNumber,
      proposedChange.leadId,
      proposedChange.managerId
    );
  });

  const resolvedChanges = await Promise.all(promises);

  const validatedBlockedBys = await validateBlockedBys(blockedBy, organizationId);

  return {
    originalElement,
    links: await Promise.all(linksWithLinkTypes),
    descriptionBullets: await Promise.all(descriptionBulletsWithTypes),
    validatedBlockedBys,
    carId: foundCarId,
    workPackageProposedChanges: resolvedChanges
  };
};

/**
 * throws an error if there are any other open unreviewed or unimplemented change requests for this wbs element
 *
 * @param wbsElemId the wbs element id to find CRs with
 * @throws if the WBS element has open unreviewed change requests
 */
export const validateNoUnreviewedOpenCRs = async (wbsElemId: string) => {
  const openCRs = await prisma.change_Request.findMany({
    where: { wbsElementId: wbsElemId, dateReviewed: null, dateDeleted: null, changes: { none: {} } }
  });
  if (openCRs.length > 1)
    throw new HttpException(400, 'There are other open unreviewed change requests for this WBS element');
};

/**
 * throws an error if there are any other open unreviewed change requests for this other reason
 * @param otherReasonId the other reason Id to find CRs with
 * @throws if the Category has open unreviewed change requests
 *
 */
export const validateNoUnreviewedOpenOtherReasonCRs = async (otherReasonId: string) => {
  const openCRs = await prisma.change_Request.findMany({
    where: { categoryId: otherReasonId, dateReviewed: null, dateDeleted: null }
  });
  if (openCRs.length > 1)
    throw new HttpException(400, 'There are other open unreviewed change requests for this WBS element');
};

/**
 * throws an error if there are any other open unreviewed change requests for this account code
 * @param accountCodeId the account code id to find CRs with
 * @throws if the Account Code has open unreviewed change requests
 *
 */
export const validateNoUnreviewedOpenAccountCodeCRs = async (accountCodeId: string) => {
  const openCRs = await prisma.change_Request.findMany({
    where: { accountCodeId, dateReviewed: null, dateDeleted: null }
  });
  if (openCRs.length > 1)
    throw new HttpException(400, 'There are other open unreviewed change requests for this WBS element');
};

/**
 * Applies the proposed changes by either creating a project if the newProject field is true or editing a project if the newProject field is false and there is an associated project
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param projectProposedChanges  the project proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 * @param carNumber the car number of the change request's WBS element
 */
export const applyProjectProposedChanges = async (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<WbsProposedChangeQueryArgs>,
  projectProposedChanges: Prisma.Project_Proposed_ChangesGetPayload<ProjectProposedChangesQueryArgs>,
  associatedProject: Project | null,
  reviewer: User,
  crId: string,
  carNumber: number,
  organization: Organization
) => {
  if (projectProposedChanges) {
    const links = wbsProposedChanges.links.map((link) => {
      return {
        ...link,
        linkTypeName: link.linkType.name
      };
    });
    const descriptionBullets = wbsProposedChanges.proposedDescriptionBulletChanges.map(
      descriptionBulletToDescriptionBulletPreview
    );

    let projectWbsNum: WbsNumber | null = null;
    if (!associatedProject) {
      const proj = await ProjectsService.createProject(
        reviewer,
        crId,
        carNumber,
        wbsProposedChanges.name,
        projectProposedChanges.summary,
        projectProposedChanges.teams.map((team) => team.teamId),
        projectProposedChanges.budget,
        links,
        descriptionBullets,
        wbsProposedChanges.leadId,
        wbsProposedChanges.managerId,
        organization
      );

      projectWbsNum = proj.wbsNum;
    } else if (associatedProject) {
      const proj = await ProjectsService.editProject(
        reviewer,
        associatedProject.projectId,
        crId,
        wbsProposedChanges.name,
        projectProposedChanges.budget,
        projectProposedChanges.summary,
        descriptionBullets,
        links,
        wbsProposedChanges.leadId,
        wbsProposedChanges.managerId,
        organization
      );

      projectWbsNum = proj.wbsNum;
    }

    for (const proposedChange of projectProposedChanges.workPackageProposedChanges) {
      await applyWorkPackageProposedChanges(
        wbsProposedChanges,
        proposedChange,
        projectWbsNum,
        null,
        reviewer,
        crId,
        organization
      );
    }
  }
};

/**
 * Applies the proposed changes by either creating a work package if the change request's WBS element is a project or editing a work package if the change request's WBS element is a work package
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param workPackageProposedChanges the work package proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param associatedWorkPackage  the optional associated work package of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 * @param organizationId the organization id of the user
 */
export const applyWorkPackageProposedChanges = async (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<WbsProposedChangeQueryArgs>,
  workPackageProposedChanges: Prisma.Work_Package_Proposed_ChangesGetPayload<WorkPackageProposedChangesQueryArgs>,
  existingWbsNum: WbsNumber | null,
  associatedWorkPackage: Work_Package | null,
  reviewer: User,
  crId: string,
  organization: Organization
) => {
  if (existingWbsNum) {
    await WorkPackagesService.createWorkPackage(
      reviewer,
      workPackageProposedChanges.wbsProposedChanges.name,
      crId,
      workPackageProposedChanges.stage as WorkPackageStage,
      workPackageProposedChanges.startDate.toISOString().split('T')[0],
      workPackageProposedChanges.duration,
      workPackageProposedChanges.blockedBy,
      workPackageProposedChanges.wbsProposedChanges.proposedDescriptionBulletChanges.map(
        descriptionBulletToDescriptionBulletPreview
      ),
      existingWbsNum,
      organization
    );
  } else if (associatedWorkPackage) {
    await WorkPackagesService.editWorkPackage(
      reviewer,
      associatedWorkPackage.workPackageId,
      wbsProposedChanges.name,
      crId,
      workPackageProposedChanges.stage as WorkPackageStage,
      workPackageProposedChanges.startDate.toISOString().split('T')[0],
      workPackageProposedChanges.duration,
      workPackageProposedChanges.blockedBy,
      wbsProposedChanges.proposedDescriptionBulletChanges.map(descriptionBulletToDescriptionBulletPreview),
      wbsProposedChanges.leadId,
      wbsProposedChanges.managerId,
      organization
    );
  }
};

/**
 * Builds a human-readable diff string comparing current WBS state to proposed changes.
 * Each changed field is shown as two lines: "− Field: old" and "+ Field: new".
 */
export const buildCRDiff = (
  currentWbs: {
    name: string;
    leadId: string | null;
    managerId: string | null;
    links: { url: string; linkType: { name: string } }[];
    project?: { budget: number; summary: string } | null;
    workPackage?: { startDate: Date; duration: number; stage: string | null } | null;
  },
  proposed: ProjectProposedChangesCreateArgs | WorkPackageProposedChangesCreateArgs | undefined
): string => {
  if (!proposed) return '';

  const isWpChange = 'startDate' in proposed;
  const lines: string[] = [];

  const addDiff = (label: string, before: string | number | null | undefined, after: string | number | null | undefined) => {
    const b = String(before ?? '(none)');
    const a = String(after ?? '(none)');
    if (b !== a) {
      lines.push(`− ${label}: ${b}`);
      lines.push(`+ ${label}: ${a}`);
    }
  };

  const addNew = (label: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined) lines.push(`+ ${label}: ${value}`);
  };

  const addLinkDiffs = (currentLinks: { url: string; linkType: { name: string } }[], proposedLinks: LinkCreateArgs[]) => {
    const currentMap = new Map(currentLinks.map((l) => [l.linkType.name, l.url]));
    const proposedMap = new Map(proposedLinks.map((l) => [l.linkTypeName, l.url]));
    for (const [name, url] of currentMap) {
      if (!proposedMap.has(name)) lines.push(`− ${name}: ${url}`);
    }
    for (const [name, url] of proposedMap) {
      if (!currentMap.has(name)) {
        lines.push(`+ ${name}: ${url}`);
      } else if (currentMap.get(name) !== url) {
        lines.push(`− ${name}: ${currentMap.get(name)}`);
        lines.push(`+ ${name}: ${url}`);
      }
    }
  };

  if (isWpChange) {
    const wpProposed = proposed as WorkPackageProposedChangesCreateArgs;
    if (!currentWbs.workPackage) {
      addNew('Name', wpProposed.name);
      addNew('Lead', wpProposed.leadId);
      addNew('Manager', wpProposed.managerId);
      addNew('Start date', wpProposed.startDate);
      addNew('Duration', wpProposed.duration);
      addNew('Stage', wpProposed.stage);
      wpProposed.links.forEach((l) => addNew(l.linkTypeName, l.url));
    } else {
      addDiff('Name', currentWbs.name, wpProposed.name);
      addDiff('Lead', currentWbs.leadId, wpProposed.leadId);
      addDiff('Manager', currentWbs.managerId, wpProposed.managerId);
      addDiff('Start date', formatDateOnly(currentWbs.workPackage.startDate, 'YYYY-MM-DD'), wpProposed.startDate);
      addDiff('Duration', currentWbs.workPackage.duration, wpProposed.duration);
      addDiff('Stage', currentWbs.workPackage.stage, wpProposed.stage);
      addLinkDiffs(currentWbs.links, wpProposed.links);
    }
  } else {
    const projProposed = proposed as ProjectProposedChangesCreateArgs;
    if (!currentWbs.project) {
      addNew('Name', projProposed.name);
      addNew('Lead', projProposed.leadId);
      addNew('Manager', projProposed.managerId);
      addNew('Budget', projProposed.budget);
      addNew('Summary', projProposed.summary);
      projProposed.links.forEach((l) => addNew(l.linkTypeName, l.url));
    } else {
      addDiff('Name', currentWbs.name, projProposed.name);
      addDiff('Lead', currentWbs.leadId, projProposed.leadId);
      addDiff('Manager', currentWbs.managerId, projProposed.managerId);
      addDiff('Budget', currentWbs.project.budget, projProposed.budget);
      addDiff('Summary', currentWbs.project.summary, projProposed.summary);
      addLinkDiffs(currentWbs.links, projProposed.links);
    }
  }

  return lines.join('\n');
};

/**
 * Sends a slack notification to the submitter of the change request that their change request has been reviewed
 * @param foundCR the change request that was reviewed
 */
export const sendCRSubmitterReviewedNotification = async (
  foundCR: Prisma.Change_RequestGetPayload<ChangeRequestQueryArgs>
) => {
  const creatorUserSettings = await prisma.user_Settings.findUnique({ where: { userId: foundCR.submitterId } });
  if (creatorUserSettings && creatorUserSettings.slackId) {
    await sendSlackCRReviewedNotification(
      creatorUserSettings.slackId,
      foundCR.crId,
      foundCR.identifier,
      foundCR.reviewNotes
    );
  }
};

export const validateWbsElement = async (wbsNum: WbsNumber, organization: Organization): Promise<WBS_Element> => {
  const wbsElement = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        ...wbsNum,
        organizationId: organization.organizationId
      }
    }
  });

  if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
  if (wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));
  return wbsElement;
};
