import { Blocked_By_Info, Role, User, WBS_Element_Status } from '@prisma/client';
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
  WorkPackageStage,
  WorkPackageTemplate,
  BlockedByCreateArgs,
  BlockedByInfo
} from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  HttpException,
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException
} from '../utils/errors.utils';
import { addDescriptionBullets, editDescriptionBullets, validateBlockedBys } from '../utils/projects.utils';
import { wbsNumOf } from '../utils/utils';
import { getUserFullName } from '../utils/users.utils';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import workPackageTransformer from '../transformers/work-packages.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import { sendSlackUpcomingDeadlineNotification } from '../utils/slack.utils';
import { createChange, createListChanges } from '../utils/changes.utils';
import {
  DescriptionBulletPreview,
  descriptionBulletToChangeListValue,
  descriptionBulletsToChangeListValues
} from '../utils/description-bullets.utils';
import { getBlockingWorkPackages } from '../utils/work-packages.utils';
import { workPackageTemplateTransformer } from '../transformers/work-package-template.transformer';
import { workPackageTemplateQueryArgs } from '../prisma-query-args/work-package-template.query-args';

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
   * Retrieve a subset of work packages.
   * @param wbsNums the WBS numbers of the work packages to retrieve
   * @returns the work packages with the given WBS numbers
   * @throws if any of the work packages are not found
   */
  static async getManyWorkPackages(wbsNums: WbsNumber[]): Promise<WorkPackage[]> {
    wbsNums.forEach((wbsNum) => {
      if (isProject(wbsNum)) {
        throw new HttpException(
          404,
          `WBS Number ${wbsNum.carNumber}.${wbsNum.projectNumber}.${wbsNum.workPackageNumber} is a project WBS#, not a Work Package WBS#`
        );
      }
    });

    const workPackagePromises = wbsNums.map(async (wbsNum) => {
      const workPackage = await prisma.work_Package.findFirst({
        where: {
          AND: [
            {
              wbsElement: {
                dateDeleted: null
              }
            },
            {
              wbsElement: {
                carNumber: wbsNum.carNumber,
                projectNumber: wbsNum.projectNumber,
                workPackageNumber: wbsNum.workPackageNumber
              }
            }
          ]
        },
        ...workPackageQueryArgs
      });

      if (!workPackage) {
        throw new NotFoundException('Work Package', wbsPipe(wbsNum));
      }
      return workPackageTransformer(workPackage);
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
   * @param expectedActivities the expected activities descriptions for this WP
   * @param deliverables the expected deliverables descriptions for this WP
   * @returns the WBS number of the successfully created work package
   * @throws if the work package could not be created
   */
  static async createWorkPackage(
    user: User,
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

    const changeRequest = await validateChangeRequestAccepted(crId);

    const wbsElem = await prisma.wBS_Element.findUnique({
      where: {
        wbsElementId: changeRequest.wbsElementId
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

    const blockedByIds: number[] = await validateBlockedBys(blockedBy);

    // get the corresponding project so we can find the next wbs number
    // and what number work package this should be
    const { carNumber, projectNumber, workPackageNumber } = wbsElem;

    const projectWbsNum: WbsNumber = {
      carNumber,
      projectNumber,
      workPackageNumber
    };

    if (wbsElem.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    if (workPackageNumber !== 0) {
      throw new HttpException(
        400,
        `Given WBS Number ${carNumber}.${projectNumber}.${workPackageNumber} is not for a project.`
      );
    }

    if (blockedBy.find((dep: WbsNumber) => equalsWbsNumber(dep, projectWbsNum))) {
      throw new HttpException(400, 'A Work Package cannot have its own project as a blocker');
    }

    const { project } = wbsElem;

    if (!project) throw new NotFoundException('Project', `${carNumber}.${projectNumber}.${workPackageNumber}`);

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
   * @param projectLeadId the new lead for this work package
   * @param projectManagerId the new manager for this work package
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
    projectLeadId: number,
    projectManagerId: number
  ): Promise<void> {
    // verify user is allowed to edit work packages
    if (isGuest(user.role)) throw new AccessDeniedGuestException('edit work packages');

    blockedBy.forEach((dep: WbsNumber) => {
      if (dep.workPackageNumber === 0) {
        throw new HttpException(400, 'A Project cannot be a Blocker');
      }
    });

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

    const updatedBlockedBys = await Promise.all(
      blockedBy.map(async (wbsNum: WbsNumber) => {
        const { carNumber, projectNumber, workPackageNumber } = wbsNum;
        const wbsElem = await prisma.wBS_Element.findUnique({
          where: {
            wbsNumber: { carNumber, projectNumber, workPackageNumber }
          }
        });

        if (!wbsElem) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
        if (wbsElem.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

        return wbsElem;
      })
    );

    const { wbsElementId } = originalWorkPackage;
    let changes = [];
    // get the changes or undefined for each of the fields
    const nameChangeJson = createChange('name', originalWorkPackage.wbsElement.name, name, crId, userId, wbsElementId!);
    const stageChangeJson = createChange('stage', originalWorkPackage.stage, stage, crId, userId, wbsElementId!);
    const startDateChangeJson = createChange(
      'start date',
      originalWorkPackage.startDate.toDateString(),
      new Date(startDate).toDateString(),
      crId,
      userId,
      wbsElementId!
    );
    const durationChangeJson = createChange('duration', originalWorkPackage.duration, duration, crId, userId, wbsElementId!);
    const blockedByChangeJson = createListChanges(
      'blocked by',
      originalWorkPackage.blockedBy.map((element) => {
        return {
          element,
          comparator: `${element.wbsElementId}`,
          displayValue: wbsPipe(wbsNumOf(element))
        };
      }),
      updatedBlockedBys.map((element) => {
        return {
          element,
          comparator: `${element.wbsElementId}`,
          displayValue: wbsPipe(wbsNumOf(element))
        };
      }),
      crId,
      userId,
      wbsElementId!
    );
    const expectedActivitiesChangeJson = createListChanges(
      'expected activity',
      descriptionBulletsToChangeListValues(originalWorkPackage.expectedActivities.filter((ele) => !ele.dateDeleted)),
      expectedActivities.map(descriptionBulletToChangeListValue),
      crId,
      userId,
      wbsElementId!
    );
    const deliverablesChangeJson = createListChanges(
      'deliverable',

      descriptionBulletsToChangeListValues(originalWorkPackage.deliverables.filter((ele) => !ele.dateDeleted)),
      deliverables.map(descriptionBulletToChangeListValue),
      crId,
      userId,
      wbsElementId!
    );

    // add to changes if not undefined
    if (nameChangeJson !== undefined) changes.push(nameChangeJson);
    if (startDateChangeJson !== undefined) changes.push(startDateChangeJson);
    if (durationChangeJson !== undefined) changes.push(durationChangeJson);
    if (stageChangeJson !== undefined) changes.push(stageChangeJson);

    const projectManagerChangeJson = createChange(
      'project manager',
      await getUserFullName(originalWorkPackage.wbsElement.managerId),
      await getUserFullName(projectManagerId),
      crId,
      userId,
      wbsElementId!
    );
    if (projectManagerChangeJson) {
      changes.push(projectManagerChangeJson);
    }

    const projectLeadChangeJson = createChange(
      'project lead',
      await getUserFullName(originalWorkPackage.wbsElement.leadId),
      await getUserFullName(projectLeadId),
      crId,
      userId,
      wbsElementId!
    );
    if (projectLeadChangeJson) {
      changes.push(projectLeadChangeJson);
    }

    // add the changes for each of blockers, expected activities, and deliverables
    changes = changes
      .concat(blockedByChangeJson.changes)
      .concat(expectedActivitiesChangeJson.changes)
      .concat(deliverablesChangeJson.changes);

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
            leadId: projectLeadId,
            managerId: projectManagerId,
            status
          }
        },
        stage,
        blockedBy: {
          set: [], // remove all the connections then add all the given ones
          connect: updatedBlockedBys.map((ele) => ({ wbsElementId: ele.wbsElementId }))
        }
      }
    });

    // Update any deleted description bullets to have their date deleted as right now
    const deletedElements: DescriptionBulletPreview[] = expectedActivitiesChangeJson.deletedElements.concat(
      deliverablesChangeJson.deletedElements
    );
    if (deletedElements.length > 0) {
      await prisma.description_Bullet.updateMany({
        where: { descriptionId: { in: deletedElements.map((descriptionBullet) => descriptionBullet.id) } },
        data: { dateDeleted: new Date() }
      });
    }

    // Add the expected activities to the workpackage
    await addDescriptionBullets(
      expectedActivitiesChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
      updatedWorkPackage.workPackageId,
      'workPackageIdExpectedActivities'
    );

    // Add the deliverables to the workpackage
    await addDescriptionBullets(
      deliverablesChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
      updatedWorkPackage.workPackageId,
      'workPackageIdDeliverables'
    );

    // edit the expected changes and deliverables
    await editDescriptionBullets(expectedActivitiesChangeJson.editedElements.concat(deliverablesChangeJson.editedElements));

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

  /**
   * Gets a single requested work package template
   * @param submitter - the user making the request to get the given work package template
   * @param workPackageTemplateId - the id of the work package template to be returned
   * @returns a single work package template
   */
  static async getSingleWorkPackageTemplate(submitter: User, workPackageTemplateId: string): Promise<WorkPackageTemplate> {
    if (isGuest(submitter.role)) {
      throw new AccessDeniedGuestException('get a work package template');
    }

    const workPackage = await prisma.work_Package_Template.findFirst({
      where: {
        dateDeleted: null,
        workPackageTemplateId
      },
      ...workPackageTemplateQueryArgs
    });

    if (!workPackage) throw new HttpException(400, `Work package template with id ${workPackageTemplateId} not found`);

    return workPackageTemplateTransformer(workPackage);
  }

  /**
   * Gets all work package templates
   * @param submitter  - the user making the request to get all work package templates
   * @returns an array of all work package templates
   */
  static async getAllWorkPackageTemplates(submitter: User): Promise<WorkPackageTemplate[]> {
    if (isGuest(submitter.role)) {
      throw new AccessDeniedGuestException('get all work package templates.');
    }
    const workPackageTemplates = await prisma.work_Package_Template.findMany({
      where: { dateDeleted: null },
      ...workPackageTemplateQueryArgs
    });
    return workPackageTemplates.map(workPackageTemplateTransformer);
  }

  /**
   * Creates a Work_Package_Template in the database
   *
   * @param user the user creating the work package template
   * @param templateName the template name
   * @param templateNotes the template notes
   * @param workPackageName the name of the work packge
   * @param stage the stage
   * @param duration the duration of the work package template in weeks
   * @param expectedActivities the expected activities descriptions for this WPT
   * @param deliverables the expected deliverables descriptions for this WPT
   * @param blockedBy the WBS elements that need to be completed before this WPT
   * @returns the WBS number of the successfully created work package template
   * @throws if the work package template could not be created
   */
  static async createWorkPackageTemplate(
    user: User,
    templateName: string,
    templateNotes: string,
    workPackageName: string | null,
    stage: WorkPackageStage | null,
    duration: number,
    expectedActivities: string[],
    deliverables: string[],
    blockedBy: WorkPackageTemplate[]
  ): Promise<WorkPackageTemplate> {
    if (!isAdmin(user.role)) throw new AccessDeniedAdminOnlyException('create work package templates');

    // get the corresponding IDs of all work package templates in BlockedBy,
    // and throw an errror if the template doesn't exist
    await Promise.all(
      blockedBy.map(async (elem) => {
        const template = await prisma.work_Package_Template.findFirst({
          where: { workPackageTemplateId: elem.workPackageTemplateId }
        });

        if (!template) {
          throw new NotFoundException('Work Package Template', templateName);
        }
        return template.workPackageTemplateId;
      })
    );

    // add to the db
    const created = await prisma.work_Package_Template.create({
      data: {
        templateName,
        templateNotes,
        workPackageName,
        stage,
        duration,
        expectedActivities,
        deliverables,
        userCreatedId: user.userId
      },
      ...workPackageTemplateQueryArgs
    });

    return workPackageTemplateTransformer(created);
  }

  /**
   * Edits a work package template given the specified parameters
   * @param submitter user who is submitting the edit
   * @param workPackageTemplateId id of the work package template being edited
   * @param templateName name of the work package template
   * @param templateNotes notes about the work package template
   * @param duration duration value on the template
   * @param stage stage value on the template
   * @param blockedByInfo array of work package template
   * @param expectedActivities array of expected activity values on the template
   * @param deliverables array of deliverable values on the template
   * @param workPackageName name value on the template
   * @returns
   */
  static async editWorkPackageTemplate(
    submitter: User,
    workPackageTemplateId: string,
    templateName: string,
    templateNotes: string,
    duration: number | undefined,
    stage: WorkPackageStage | undefined,
    blockedByInfo: BlockedByCreateArgs[],
    expectedActivities: string[],
    deliverables: string[],
    workPackageName: string | undefined
  ): Promise<WorkPackageTemplate> {
    const originalWorkPackageTemplate = await prisma.work_Package_Template.findUnique({
      where: { workPackageTemplateId },
      include: { blockedBy: true }
    });

    if (!originalWorkPackageTemplate) throw new NotFoundException('Work Package Template', workPackageTemplateId);
    if (originalWorkPackageTemplate.dateDeleted) throw new DeletedException('Work Package Template', workPackageTemplateId);
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('edit work package templates');

    const updatedBlockedByIds = blockedByInfo.map((blockedBy) => blockedBy.blockedByInfoId);
    const originalBlockedByIds = originalWorkPackageTemplate.blockedBy.map((blockedBy) => blockedBy.blockedByInfoId);

    // A blocked by is deleted if the new list does not contain it
    const deleteBlockedByIds = originalWorkPackageTemplate.blockedBy
      .filter((blockedByItem: Blocked_By_Info) => {
        return !updatedBlockedByIds.includes(blockedByItem.blockedByInfoId);
      })
      .map((item) => item.blockedByInfoId);

    // A blocked by is updated if both the new and old list contain it
    const updatedBlockedBy = blockedByInfo.filter((blockedByItem) => {
      return blockedByItem.blockedByInfoId && originalBlockedByIds.includes(blockedByItem.blockedByInfoId);
    });

    // A blocked by is created if the old list does not contain it
    const newBlockedBy = blockedByInfo.filter((blockedByItem: BlockedByCreateArgs) => {
      return !originalWorkPackageTemplate.blockedBy.some(
        (oldItem) => oldItem.blockedByInfoId === blockedByItem.blockedByInfoId
      );
    });

    // deleting old blocked by
    await prisma.blocked_By_Info.deleteMany({
      where: {
        blockedByInfoId: {
          in: deleteBlockedByIds
        }
      }
    });

    // creating new blocked by
    const createdBlockedByPromises = newBlockedBy.map((blockedBy) =>
      prisma.blocked_By_Info.create({
        data: {
          workPackageTemplateId,
          stage: blockedBy.stage,
          name: blockedBy.name
        }
      })
    );

    await Promise.all(createdBlockedByPromises);

    // updating existing blocked by
    const updatedBlockedByPromises = updatedBlockedBy.map((blockedBy) => {
      return prisma.blocked_By_Info.update({
        where: {
          blockedByInfoId: blockedBy.blockedByInfoId
        },
        data: {
          stage: blockedBy.stage ? blockedBy.stage : null,
          name: blockedBy.name
        }
      });
    });

    await Promise.all(updatedBlockedByPromises);

    const updatedWorkPackageTemplate = await prisma.work_Package_Template.update({
      where: {
        workPackageTemplateId
      },
      data: {
        templateName,
        templateNotes,
        duration,
        stage,
        expectedActivities,
        deliverables,
        workPackageName
      },
      ...workPackageTemplateQueryArgs
    });

    return workPackageTemplateTransformer(updatedWorkPackageTemplate);
  }
}
