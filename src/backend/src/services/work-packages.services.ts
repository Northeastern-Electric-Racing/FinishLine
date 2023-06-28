import { Role, User, WBS_Element, WBS_Element_Status } from '@prisma/client';
import {
  getDay,
  DescriptionBullet,
  equalsWbsNumber,
  isAdmin,
  isGuest,
  isProject,
  TimelineStatus,
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
  DeletedException
} from '../utils/errors.utils';
import {
  createChangeJsonDates,
  createChangeJsonNonList,
  createBlockedByChangesJson,
  createDescriptionBulletChangesJson,
  getBlockingWorkPackages
} from '../utils/work-packages.utils';
import { addDescriptionBullets, editDescriptionBullets } from '../utils/projects.utils';
import { descBulletConverter } from '../utils/utils';
import { getUserFullName } from '../utils/users.utils';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import workPackageTransformer from '../transformers/work-packages.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import { sendSlackUpcomingDeadlineNotification } from '../utils/slack.utils';

/** Service layer containing logic for work package controller functions. */
export default class WorkPackagesService {
  /**
   * Retrieve all work packages, optionally filtered by query parameters.
   *
   * @param query the filters on the query
   * @returns a list of work packages
   */
  static async getAllWorkPackages(query: {
    status?: WbsElementStatus;
    timelineStatus?: TimelineStatus;
    daysUntilDeadline?: string;
  }): Promise<WorkPackage[]> {
    const workPackages = await prisma.work_Package.findMany({
      where: { wbsElement: { dateDeleted: null } },
      ...workPackageQueryArgs
    });

    const outputWorkPackages = workPackages.map(workPackageTransformer).filter((wp) => {
      let passes = true;
      if (query.status) passes &&= wp.status === query.status;
      if (query.timelineStatus) passes &&= wp.timelineStatus === query.timelineStatus;
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
   *
   * @param query the filters on the query
   * @returns the desired work package
   * @throws if the work package with the desired WBS number is not found
   */
  static async getSingleWorkPackage(parsedWbs: WbsNumber): Promise<WorkPackage> {
    if (isProject(parsedWbs)) {
      throw new HttpException(
        404,
        'WBS Number ' +
          `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}` +
          ' is a project WBS#, not a Work Package WBS#'
      );
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
      ...workPackageQueryArgs
    });

    if (!wp)
      throw new NotFoundException(
        'Work Package',
        `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}`
      );

    return workPackageTransformer(wp);
  }

  /**
   * Creates a Work_Package in the database
   * @param user the user creating the work package
   * @param projectWbsNum the WBS number of the attached project
   * @param name the name of the new work package
   * @param crId the id of the change request creating this work package
   * @param stage the stage of the work package
   * @param startDate the date string representing the start date
   * @param duration the expected duration of this work package, in weeks
   * @param blockedBy the WBS elements that need to be completed before this WP
   * @param expectedActivities the expected activities descriptions for this WP
   * @param deliverables the expected deliverables descriptions for this WP
   * @returns the WBS number of the successfully created work package
   * @throws if the work package could not be created
   */
  static async createWorkPackage(
    user: User,
    projectWbsNum: WbsNumber,
    name: string,
    crId: number,
    stage: WorkPackageStage | null,
    startDate: string,
    duration: number,
    blockedBy: WbsNumber[],
    expectedActivities: string[],
    deliverables: string[]
  ): Promise<string> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('create work packages');

    await validateChangeRequestAccepted(crId);

    // get the corresponding project so we can find the next wbs number
    // and what number work package this should be
    const { carNumber, projectNumber, workPackageNumber } = projectWbsNum;

    if (workPackageNumber !== 0) {
      throw new HttpException(
        400,
        `Given WBS Number ${carNumber}.${projectNumber}.${workPackageNumber} is not for a project.`
      );
    }

    if (blockedBy.find((dep: WbsNumber) => equalsWbsNumber(dep, projectWbsNum))) {
      throw new HttpException(400, 'A Work Package cannot have its own project as a blocker');
    }

    const wbsElem = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      include: {
        project: {
          include: {
            workPackages: { include: { wbsElement: true, blockedBy: true } }
          }
        }
      }
    });

    if (!wbsElem) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElem.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    const { project } = wbsElem;

    if (!project) throw new NotFoundException('Project', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    const { projectId } = project;

    const newWorkPackageNumber: number =
      project.workPackages
        .map((element) => element.wbsElement.workPackageNumber)
        .reduce((prev, curr) => Math.max(prev, curr), 0) + 1;

    const blockedByWBSElems: (WBS_Element | null)[] = await Promise.all(
      blockedBy.map(async (ele: WbsNumber) => {
        return await prisma.wBS_Element.findUnique({
          where: {
            wbsNumber: {
              carNumber: ele.carNumber,
              projectNumber: ele.projectNumber,
              workPackageNumber: ele.workPackageNumber
            }
          }
        });
      })
    );

    const blockedByIds: number[] = [];
    // populate blockedByIds with the element ID's
    // and return error 400 if any elems are null

    let blockedByHasNulls = false;
    blockedByWBSElems.forEach((elem) => {
      if (!elem) {
        blockedByHasNulls = true;
        return;
      }
      blockedByIds.push(elem.wbsElementId);
    });

    if (blockedByHasNulls) {
      throw new HttpException(400, 'One of the blockers was not found.');
    }

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
            }
          }
        },
        stage,
        project: { connect: { projectId } },
        startDate: date,
        duration,
        orderInProject: project.workPackages.length + 1,
        blockedBy: { connect: blockedByIds.map((ele) => ({ wbsElementId: ele })) },
        expectedActivities: { create: expectedActivities.map((ele: string) => ({ detail: ele })) },
        deliverables: { create: deliverables.map((ele: string) => ({ detail: ele })) }
      },
      include: {
        wbsElement: true
      }
    });

    return `${created.wbsElement.carNumber}.${created.wbsElement.projectNumber}.${created.wbsElement.workPackageNumber}`;
  }

  /**
   * Edits a Work_Package in the database
   * @param user the user editing the work package
   * @param workPackageId the id of the work package
   * @param name the new name of the work package
   * @param crId the id of the change request implementing this edit
   * @param startDate the date string representing the new start date
   * @param duration the new duration of this work package, in weeks
   * @param blockedBy the new WBS elements to be completed before this WP
   * @param expectedActivities the new expected activities descriptions for this WP
   * @param deliverables the new expected deliverables descriptions for this WP
   * @param projectLead the new lead for this work package
   * @param projectManager the new manager for this work package
   */
  static async editWorkPackage(
    user: User,
    workPackageId: number,
    name: string,
    crId: number,
    stage: WorkPackageStage | null,
    startDate: string,
    duration: number,
    blockedBy: WbsNumber[],
    expectedActivities: DescriptionBullet[],
    deliverables: DescriptionBullet[],
    projectLead: number,
    projectManager: number
  ): Promise<void> {
    // verify user is allowed to edit work packages
    if (isGuest(user.role)) throw new AccessDeniedGuestException('edit work packages');

    const { userId } = user;

    // get the original work package so we can compare things
    const originalWorkPackage = await prisma.work_Package.findUnique({
      where: { workPackageId },
      include: {
        wbsElement: true,
        blockedBy: true,
        expectedActivities: true,
        deliverables: true
      }
    });

    if (!originalWorkPackage) throw new NotFoundException('Work Package', workPackageId);
    if (originalWorkPackage.wbsElement.dateDeleted) throw new DeletedException('Work Package', workPackageId);

    if (
      blockedBy.find((dep: WbsNumber) =>
        equalsWbsNumber(dep, {
          carNumber: originalWorkPackage.wbsElement.carNumber,
          projectNumber: originalWorkPackage.wbsElement.projectNumber,
          workPackageNumber: 0
        })
      ) != null
    ) {
      throw new HttpException(400, 'A Work Package cannot have own project as a blocker');
    }

    if (
      blockedBy.find((dep: WbsNumber) =>
        equalsWbsNumber(dep, {
          carNumber: originalWorkPackage.wbsElement.carNumber,
          projectNumber: originalWorkPackage.wbsElement.projectNumber,
          workPackageNumber: originalWorkPackage.wbsElement.workPackageNumber
        })
      ) != null
    ) {
      throw new HttpException(400, 'A Work Package cannot have own project as a blocker');
    }

    // the crId must match a valid approved change request
    await validateChangeRequestAccepted(crId);

    const depsIds = await Promise.all(
      blockedBy.map(async (wbsNum: WbsNumber) => {
        const { carNumber, projectNumber, workPackageNumber } = wbsNum;
        const wbsElem = await prisma.wBS_Element.findUnique({
          where: {
            wbsNumber: { carNumber, projectNumber, workPackageNumber }
          }
        });

        if (!wbsElem) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
        if (wbsElem.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

        return wbsElem.wbsElementId;
      })
    );

    const { wbsElementId } = originalWorkPackage;
    let changes = [];
    // get the changes or undefined for each of the fields
    const nameChangeJson = createChangeJsonNonList(
      'name',
      originalWorkPackage.wbsElement.name,
      name,
      crId,
      userId,
      wbsElementId!
    );
    const stageChangeJson = createChangeJsonNonList(
      'stage',
      originalWorkPackage.stage,
      stage ?? 'None',
      crId,
      userId,
      wbsElementId!
    );
    const startDateChangeJson = createChangeJsonDates(
      'start date',
      originalWorkPackage.startDate,
      new Date(startDate),
      crId,
      userId,
      wbsElementId!
    );
    const durationChangeJson = createChangeJsonNonList(
      'duration',
      originalWorkPackage.duration,
      duration,
      crId,
      userId,
      wbsElementId!
    );
    const blockedByChangeJson = await createBlockedByChangesJson(
      originalWorkPackage.blockedBy.map((element) => element.wbsElementId),
      depsIds.map((elem) => elem as number),
      crId,
      userId,
      wbsElementId!,
      'blocked by'
    );
    const expectedActivitiesChangeJson = createDescriptionBulletChangesJson(
      originalWorkPackage.expectedActivities
        .filter((ele) => !ele.dateDeleted)
        .map((element) => descBulletConverter(element)),
      expectedActivities,
      crId,
      userId,
      wbsElementId!,
      'expected activity'
    );
    const deliverablesChangeJson = createDescriptionBulletChangesJson(
      originalWorkPackage.deliverables.filter((ele) => !ele.dateDeleted).map((element) => descBulletConverter(element)),
      deliverables,
      crId,
      userId,
      wbsElementId!,
      'deliverable'
    );

    // add to changes if not undefined
    if (nameChangeJson !== undefined) changes.push(nameChangeJson);
    if (startDateChangeJson !== undefined) changes.push(startDateChangeJson);
    if (durationChangeJson !== undefined) changes.push(durationChangeJson);
    if (stageChangeJson !== undefined) changes.push(stageChangeJson);

    const projectManagerChangeJson = createChangeJsonNonList(
      'project manager',
      await getUserFullName(originalWorkPackage.wbsElement.projectManagerId),
      await getUserFullName(projectManager),
      crId,
      userId,
      wbsElementId!
    );
    if (projectManagerChangeJson) {
      changes.push(projectManagerChangeJson);
    }

    const projectLeadChangeJson = createChangeJsonNonList(
      'project lead',
      await getUserFullName(originalWorkPackage.wbsElement.projectLeadId),
      await getUserFullName(projectLead),
      crId,
      userId,
      wbsElementId!
    );
    if (projectLeadChangeJson) {
      changes.push(projectLeadChangeJson);
    }

    // add the changes for each of blockers, expected activities, and deliverables
    changes = changes
      .concat(blockedByChangeJson)
      .concat(expectedActivitiesChangeJson.changes)
      .concat(deliverablesChangeJson.changes);

    // make the date object but add 12 hours so that the time isn't 00:00 to avoid timezone problems
    const date = new Date(startDate);
    date.setTime(date.getTime() + 12 * 60 * 60 * 1000);

    // update the work package with the input fields
    const updatedWorkPackage = await prisma.work_Package.update({
      where: { wbsElementId },
      data: {
        startDate: date,
        duration,
        wbsElement: {
          update: {
            name,
            projectLeadId: projectLead,
            projectManagerId: projectManager
          }
        },
        stage,
        blockedBy: {
          set: [], // remove all the connections then add all the given ones
          connect: depsIds.map((ele) => ({ wbsElementId: ele }))
        }
      }
    });

    // Update any deleted description bullets to have their date deleted as right now
    const deletedIds = expectedActivitiesChangeJson.deletedIds.concat(deliverablesChangeJson.deletedIds);
    if (deletedIds.length > 0) {
      await prisma.description_Bullet.updateMany({
        where: { descriptionId: { in: deletedIds } },
        data: { dateDeleted: new Date() }
      });
    }

    addDescriptionBullets(
      expectedActivitiesChangeJson.addedDetails,
      updatedWorkPackage.workPackageId,
      'workPackageIdExpectedActivities'
    );
    addDescriptionBullets(
      deliverablesChangeJson.addedDetails,
      updatedWorkPackage.workPackageId,
      'workPackageIdDeliverables'
    );
    editDescriptionBullets(
      expectedActivitiesChangeJson.editedIdsAndDetails.concat(deliverablesChangeJson.editedIdsAndDetails)
    );

    // create the changes in prisma
    await prisma.change.createMany({ data: changes });
  }

  /**
   * Deletes the Work Package
   * @param submitter The user who deleted the work package
   * @param wbsNum The work package number to be deleted
   */
  static async deleteWorkPackage(submitter: User, wbsNum: WbsNumber): Promise<void> {
    // Verify submitter is allowed to delete work packages
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('delete work packages');

    const { carNumber, projectNumber, workPackageNumber } = wbsNum;

    if (workPackageNumber === 0) throw new HttpException(400, `${wbsPipe(wbsNum)} is not a valid work package WBS!`);

    // Verify if the work package to be deleted exist and if it already has been deleted
    const workPackage = await prisma.work_Package.findFirst({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      ...workPackageQueryArgs
    });

    if (!workPackage) throw new NotFoundException('Work Package', wbsPipe(wbsNum));
    if (workPackage.wbsElement.dateDeleted) throw new DeletedException('Work Package', wbsPipe(wbsNum));

    const { wbsElementId, workPackageId } = workPackage;

    const dateDeleted = new Date();
    const deletedByUserId = submitter.userId;

    // Soft delete the work package by updating its related "deleted" fields
    await prisma.work_Package.update({
      where: {
        workPackageId
      },
      data: {
        // Soft delete the given wp's wbs by soft deleting crs and task
        wbsElement: {
          update: {
            changeRequests: {
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
            deletedByUserId
          }
        },
        // Soft delete wp's related dsecription_bullet fields
        deliverables: {
          updateMany: {
            where: {
              workPackageIdDeliverables: workPackageId
            },
            data: {
              dateDeleted
            }
          }
        },
        expectedActivities: {
          updateMany: {
            where: {
              workPackageIdExpectedActivities: workPackageId
            },
            data: {
              dateDeleted
            }
          }
        }
      }
    });
  }

  /**
   * Gets the work packages the given work package is blocking
   * @param wbsNum the wbs number of the work package to get the blocking work packages for
   * @returns the blocking work packages for the given work package
   */
  static async getBlockingWorkPackages(wbsNum: WbsNumber): Promise<WorkPackage[]> {
    const { carNumber, projectNumber, workPackageNumber } = wbsNum;

    // is a project so just return empty array until we implement blocking projects
    if (workPackageNumber === 0) return [];

    const workPackage = await prisma.work_Package.findFirst({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      ...workPackageQueryArgs
    });

    if (!workPackage) throw new NotFoundException('Work Package', wbsPipe(wbsNum));

    if (workPackage.wbsElement.dateDeleted) throw new DeletedException('Work Package', workPackage.wbsElementId);

    const blockingWorkPackages = await getBlockingWorkPackages(workPackage);

    return blockingWorkPackages.map(workPackageTransformer);
  }

  /**
   * Send a slack message to the project lead of each work package telling them when their work package is due.
   * Sends a message for every work package that is due before or on the given deadline (even before today)
   * @param user - the user doing the sending
   * @param deadline - the deadline
   * @returns
   */
  static async slackMessageUpcomingDeadlines(user: User, deadline: Date): Promise<void> {
    if (user.role !== Role.APP_ADMIN && user.role !== Role.ADMIN)
      throw new AccessDeniedAdminOnlyException('send the upcoming deadlines slack messages');

    const workPackages = await prisma.work_Package.findMany({
      where: { wbsElement: { dateDeleted: null, status: WBS_Element_Status.ACTIVE } },
      ...workPackageQueryArgs
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

    return;
  }
}
