import { Prisma, User, WBS_Element, WBS_Element_Status } from '@prisma/client';
import {
  DescriptionBulletPreview,
  getDay,
  isAdmin,
  isGuest,
  isWorkPackage,
  WbsElementStatus,
  WbsNumber,
  wbsPipe,
  WorkPackage,
  WorkPackageStage
} from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  HttpException,
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import { WorkPackageQueryArgs, getWorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';
import workPackageTransformer from '../transformers/work-packages.transformer';
import { updateBlocking, validateChangeRequestAccepted } from '../utils/change-requests.utils';
import { sendSlackUpcomingDeadlineNotification } from '../utils/slack.utils';
import { getWorkPackageChanges } from '../utils/changes.utils';
import {
  DescriptionBulletDestination,
  addRawDescriptionBullets,
  editDescriptionBullets
} from '../utils/description-bullets.utils';
import { getBlockingWorkPackages, validateBlockedBys } from '../utils/work-packages.utils';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';
import { userHasPermission } from '../utils/users.utils';

/** Service layer containing logic for work package controller functions. */
export default class WorkPackagesService {
  /**
   * Retrieve all work packages, optionally filtered by query parameters.
   *
   * @param query the filters on the query
   * @param organizationId the id of the organization that the user is currently in
   * @returns a list of work packages
   */
  static async getAllWorkPackages(
    query: {
      status?: WbsElementStatus;
      daysUntilDeadline?: string;
    },
    organizationId: string
  ): Promise<WorkPackage[]> {
    const workPackages = await prisma.work_Package.findMany({
      where: { wbsElement: { dateDeleted: null, organizationId } },
      ...getWorkPackageQueryArgs(organizationId)
    });

    const outputWorkPackages = workPackages.map(workPackageTransformer).filter((wp) => {
      let passes = true;
      if (query.status) passes &&= wp.status === query.status;
      if (query.daysUntilDeadline) {
        const daysToDeadline = Math.round((wp.endDate.getTime() - new Date().getTime()) / 86400000);
        passes &&= daysToDeadline <= parseInt(query?.daysUntilDeadline as string);
      }
      return passes;
    });

    outputWorkPackages.sort((wpA, wpB) => wpA.endDate.getTime() - wpB.endDate.getTime());

    return outputWorkPackages;
  }

  /**
   * Retrieve the work package with the specified WBS number.
   * @param parsedWbs the WBS number of the desired work package
   * @param organizationId the id of the organization that the user is currently in
   * @returns the desired work package
   * @throws if the work package with the desired WBS number is not found, is deleted or is not part of the given organization
   */
  static async getSingleWorkPackage(parsedWbs: WbsNumber, organizationId: string): Promise<WorkPackage> {
    if (!isWorkPackage(parsedWbs)) {
      throw new HttpException(404, 'WBS Number ' + wbsPipe(parsedWbs) + ' is a not a work package WBS#');
    }

    const wp = await prisma.work_Package.findFirst({
      where: {
        wbsElement: {
          dateDeleted: null,
          carNumber: parsedWbs.carNumber,
          projectNumber: parsedWbs.projectNumber,
          workPackageNumber: parsedWbs.workPackageNumber
        }
      },
      ...getWorkPackageQueryArgs(organizationId)
    });

    if (!wp)
      throw new NotFoundException(
        'Work Package',
        `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}`
      );

    if (wp.wbsElement.dateDeleted) throw new DeletedException('Work Package', wp.wbsElementId);

    if (wp.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Work Package');

    return workPackageTransformer(wp);
  }

  /**
   * Retrieve a subset of work packages.
   * @param wbsNums the WBS numbers of the work packages to retrieve
   * @param organizationId the id of the organization that the user is currently in
   * @returns the work packages with the given WBS numbers
   * @throws if any of the work packages are not found or are not part of the organization
   */
  static async getManyWorkPackages(wbsNums: WbsNumber[], organizationId: string): Promise<WorkPackage[]> {
    wbsNums.forEach((wbsNum) => {
      if (!isWorkPackage(wbsNum)) {
        throw new HttpException(
          404,
          `WBS Number ${wbsNum.carNumber}.${wbsNum.projectNumber}.${wbsNum.workPackageNumber} is not a Work Package WBS#`
        );
      }
    });

    const workPackagePromises = wbsNums.map(async (wbsNum) => {
      return WorkPackagesService.getSingleWorkPackage(wbsNum, organizationId);
    });

    const resolvedWorkPackages = await Promise.all(workPackagePromises);
    return resolvedWorkPackages;
  }

  /**
   * Creates a Work_Package in the database
   * @param user the user creating the work package
   * @param name the name of the new work package
   * @param crId the id of the change request creating this work package
   * @param stage the stage of the work package
   * @param startDate the date string representing the start date
   * @param duration the expected duration of this work package, in weeks
   * @param blockedBy the WBS elements that need to be completed before this WP
   * @param descriptionBullets the description bullets associated with this WP
   * @param organizationId the id of the organization that the user is currently in
   * @returns the WBS number of the successfully created work package
   * @throws if the work package could not be created
   */
  static async createWorkPackage(
    user: User,
    name: string,
    crId: string,
    stage: WorkPackageStage | null,
    startDate: string,
    duration: number,
    blockedBy: WbsNumber[],
    descriptionBullets: DescriptionBulletPreview[],
    organizationId: string,
    wbsElemId?: string
  ): Promise<Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>> {
    if (await userHasPermission(user.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('create work packages');

    const changeRequest = await validateChangeRequestAccepted(crId);

    if (!wbsElemId) wbsElemId = changeRequest.wbsElementId;

    const wbsElem = await prisma.wBS_Element.findUnique({
      where: {
        wbsElementId: wbsElemId
      },
      include: {
        project: {
          include: {
            workPackages: { include: { wbsElement: true, blockedBy: true } }
          }
        }
      }
    });

    if (!wbsElem) throw new NotFoundException('WBS Element', changeRequest.wbsElementId);
    const blockedByElements: WBS_Element[] = await validateBlockedBys(blockedBy, organizationId);

    // get the corresponding project so we can find the next wbs number
    // and what number work package this should be
    const { carNumber, projectNumber, workPackageNumber } = wbsElem;

    const projectWbsNum: WbsNumber = {
      carNumber,
      projectNumber,
      workPackageNumber
    };

    if (wbsElem.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(projectWbsNum));

    if (workPackageNumber !== 0) {
      throw new HttpException(400, `Given WBS Number ${wbsPipe(projectWbsNum)} is not for a project.`);
    }

    const { project } = wbsElem;

    if (!project) throw new NotFoundException('Project', `${wbsPipe(projectWbsNum)}`);
    if (wbsElem.organizationId !== organizationId) throw new InvalidOrganizationException('Project');

    const { projectId } = project;

    const newWorkPackageNumber: number =
      project.workPackages
        .map((element) => element.wbsElement.workPackageNumber)
        .reduce((prev, curr) => Math.max(prev, curr), 0) + 1;

    // make the date object but add 12 hours so that the time isn't 00:00 to avoid timezone problems
    const date = new Date(startDate.split('T')[0]);
    date.setTime(date.getTime() + 12 * 60 * 60 * 1000);

    // add to the database
    const created = await prisma.work_Package.create({
      data: {
        wbsElement: {
          create: {
            carNumber,
            projectNumber,
            workPackageNumber: newWorkPackageNumber,
            name,
            changes: {
              create: {
                changeRequestId: crId,
                implementerId: user.userId,
                detail: 'New Work Package Created'
              }
            },
            organizationId: wbsElem.organizationId
          }
        },
        stage,
        project: { connect: { projectId } },
        startDate: date,
        duration,
        orderInProject: project.workPackages.length + 1,
        blockedBy: { connect: blockedByElements.map((ele) => ({ wbsElementId: ele.wbsElementId })) }
      },
      ...getWorkPackageQueryArgs(organizationId)
    });

    const changes = await getWorkPackageChanges(
      null,
      name,
      null,
      stage,
      null,
      new Date(startDate),
      null,
      duration,
      [],
      blockedByElements,
      null,
      null,
      null,
      null,
      [],
      descriptionBullets,
      crId,
      created.wbsElementId,
      user.userId
    );

    // Add the description bullets to the workpackage
    await addRawDescriptionBullets(
      descriptionBullets,
      DescriptionBulletDestination.WBS_ELEMENT,
      created.wbsElement.wbsElementId,
      created.wbsElement.organizationId
    );

    await prisma.change.createMany({ data: changes.changes });

    return created;
  }

  /**
   * Edits a Work Package in the database
   * @param user the user editing the work package
   * @param workPackageId the id of the work package
   * @param name the new name of the work package
   * @param crId the id of the change request implementing this edit
   * @param startDate the date string representing the new start date
   * @param duration the new duration of this work package, in weeks
   * @param blockedBy the new WBS elements to be completed before this WP
   * @param descriptionBullets the new description bullets associated with this WP
   * @param leadId the new lead for this work package
   * @param managerId the new manager for this work package
   * @param organizationId the id of the organization that the user is currently in
   */
  static async editWorkPackage(
    user: User,
    workPackageId: string,
    name: string,
    crId: string,
    stage: WorkPackageStage | null,
    startDate: string,
    duration: number,
    blockedBy: WbsNumber[],
    descriptionBullets: DescriptionBulletPreview[],
    leadId: string | null,
    managerId: string | null,
    organizationId: string
  ): Promise<WorkPackage> {
    const { userId } = user;
    // verify user is allowed to edit work packages
    if (await userHasPermission(userId, organizationId, isGuest)) throw new AccessDeniedGuestException('edit work packages');

    // get the original work package so we can compare things
    const originalWorkPackage = await prisma.work_Package.findUnique({
      where: { workPackageId },
      include: {
        wbsElement: {
          include: {
            descriptionBullets: getDescriptionBulletQueryArgs(organizationId)
          }
        },
        blockedBy: true
      }
    });

    if (!originalWorkPackage) throw new NotFoundException('Work Package', workPackageId);
    if (originalWorkPackage.wbsElement.dateDeleted) throw new DeletedException('Work Package', workPackageId);
    if (originalWorkPackage.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Work Package');

    // the crId must match a valid approved change request
    await validateChangeRequestAccepted(crId);

    const { wbsElementId } = originalWorkPackage;

    const blockedByElems = await validateBlockedBys(blockedBy, organizationId);

    const changes = await getWorkPackageChanges(
      originalWorkPackage.wbsElement.name,
      name,
      originalWorkPackage.stage,
      stage,
      originalWorkPackage.startDate,
      new Date(startDate),
      originalWorkPackage.duration,
      duration,
      originalWorkPackage.blockedBy,
      blockedByElems,
      originalWorkPackage.wbsElement.managerId,
      leadId,
      originalWorkPackage.wbsElement.leadId,
      managerId,
      originalWorkPackage.wbsElement.descriptionBullets,
      descriptionBullets,
      crId,
      wbsElementId,
      userId
    );

    // make the date object but add 12 hours so that the time isn't 00:00 to avoid timezone problems
    const date = new Date(startDate);
    date.setTime(date.getTime() + 12 * 60 * 60 * 1000);

    // set the status of the wbs element to active if an edit is made to a completed version
    const status =
      originalWorkPackage.wbsElement.status === WbsElementStatus.Complete
        ? WbsElementStatus.Active
        : originalWorkPackage.wbsElement.status;

    // update the work package with the input fields
    const updatedWorkPackage = await prisma.work_Package.update({
      where: { wbsElementId },
      data: {
        startDate: date,
        duration,
        wbsElement: {
          update: {
            name,
            leadId,
            managerId,
            status
          }
        },
        stage,
        blockedBy: {
          set: [], // remove all the connections then add all the given ones
          connect: blockedByElems.map((ele) => ({ wbsElementId: ele.wbsElementId }))
        }
      },
      ...getWorkPackageQueryArgs(organizationId)
    });

    // Transform Milliseconds to weeks
    const timelineImpact =
      (updatedWorkPackage.startDate.getTime() - originalWorkPackage.startDate.getTime()) / 1000 / 60 / 60 / 24 / 7 +
      updatedWorkPackage.duration -
      originalWorkPackage.duration;

    await updateBlocking(updatedWorkPackage, timelineImpact, crId, user);

    // Update any deleted description bullets to have their date deleted as right now
    if (changes.deletedDescriptionBullets.length > 0) {
      await prisma.description_Bullet.updateMany({
        where: { descriptionId: { in: changes.deletedDescriptionBullets.map((descriptionBullet) => descriptionBullet.id) } },
        data: { dateDeleted: new Date() }
      });
    }

    // Add the new description bullets to the workpackage
    await addRawDescriptionBullets(
      changes.addedDescriptionBullets,
      DescriptionBulletDestination.WBS_ELEMENT,
      wbsElementId,
      originalWorkPackage.wbsElement.organizationId
    );

    // edit the expected changes and deliverables
    await editDescriptionBullets(changes.editedDescriptionBullets, originalWorkPackage.wbsElement.organizationId);

    // create the changes in prisma
    await prisma.change.createMany({ data: changes.changes });

    return workPackageTransformer(updatedWorkPackage);
  }

  /**
   * Deletes the Work Package
   * @param submitter The user who deleted the work package
   * @param wbsNum The work package number to be deleted
   * @param crId The id of the change request to be implemented by this deletion
   * @param organizationId The organization id that the user is in
   */
  static async deleteWorkPackage(submitter: User, wbsNum: WbsNumber, crId: string, organizationId: string): Promise<void> {
    // Verify submitter is allowed to delete work packages
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete work packages');

    const workPackage = await WorkPackagesService.getSingleWorkPackage(wbsNum, organizationId);

    const { wbsElementId, id: workPackageId } = workPackage;

    await validateChangeRequestAccepted(crId);

    await prisma.change.create({
      data: {
        changeRequestId: crId,
        implementerId: submitter.userId,
        wbsElementId,
        detail: 'Work Package Deleted'
      }
    });

    const dateDeleted = new Date();
    const deletedByUserId = submitter.userId;

    // Soft delete the work package by updating its related "deleted" fields
    await prisma.work_Package.update({
      where: {
        workPackageId
      },
      data: {
        // Soft delete the given wp's wbs by setting crs to denied and soft deleting tasks
        wbsElement: {
          update: {
            changeRequests: {
              updateMany: {
                where: {
                  wbsElementId
                },
                data: {
                  accepted: false,
                  dateReviewed: dateDeleted
                }
              }
            },
            tasks: {
              updateMany: {
                where: {
                  wbsElementId
                },
                data: {
                  dateDeleted,
                  deletedByUserId
                }
              }
            },
            dateDeleted,
            deletedByUserId,
            descriptionBullets: {
              updateMany: {
                where: {
                  wbsElementId
                },
                data: {
                  dateDeleted
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Gets the work packages the given work package is blocking
   * @param wbsNum the wbs number of the work package to get the blocking work packages for
   * @param organizationId the id of the organization that the user is currently in
   * @returns the blocking work packages for the given work package
   */
  static async getBlockingWorkPackages(wbsNum: WbsNumber, organizationId: string): Promise<WorkPackage[]> {
    const { carNumber, projectNumber, workPackageNumber } = wbsNum;

    // is a project or car so just return empty array until we implement blocking projects/cars
    if (!isWorkPackage(wbsNum)) return [];

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId
        }
      },
      include: {
        workPackage: getWorkPackageQueryArgs(organizationId)
      }
    });

    const workPackage = wbsElement?.workPackage;

    if (!workPackage) throw new NotFoundException('Work Package', wbsPipe(wbsNum));
    if (workPackage.wbsElement.dateDeleted) throw new DeletedException('Work Package', workPackage.wbsElementId);
    if (workPackage.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Work Package');

    const blockingWorkPackages = await getBlockingWorkPackages(workPackage);

    return blockingWorkPackages.map(workPackageTransformer);
  }

  /**
   * Send a slack message to the project lead of each work package telling them when their work package is due.
   * Sends a message for every work package that is due before or on the given deadline (even before today)
   * @param user - the user doing the sending
   * @param deadline - the deadline
   * @param organizationId - the id of the organization that the user is currently in
   * @returns void
   */
  static async slackMessageUpcomingDeadlines(user: User, deadline: Date, organizationId: string): Promise<void> {
    if (!(await userHasPermission(user.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('send the upcoming deadlines slack messages');

    const workPackages = await prisma.work_Package.findMany({
      where: { wbsElement: { dateDeleted: null, status: WBS_Element_Status.ACTIVE, organizationId } },
      ...getWorkPackageQueryArgs(organizationId)
    });

    const upcomingWorkPackages = workPackages
      .map(workPackageTransformer)
      .filter((wp) => getDay(wp.endDate) <= getDay(deadline))
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

    // have to do it like this so it goes sequentially and we can sleep between each because of rate limiting
    await upcomingWorkPackages.reduce(
      (previousCall, workPackage) =>
        previousCall.then(async () => {
          await sendSlackUpcomingDeadlineNotification(workPackage); // send the slack message for this work package
          await new Promise((callBack) => setTimeout(callBack, 2000)); // sleep for 2 seconds
        }),
      Promise.resolve()
    );
  }
}
