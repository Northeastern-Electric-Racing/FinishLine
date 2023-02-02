import { Role, User, WBS_Element } from '@prisma/client';
import {
  DescriptionBullet,
  equalsWbsNumber,
  isProject,
  TimelineStatus,
  WbsElementStatus,
  WbsNumber,
  wbsPipe,
  WorkPackage
} from 'shared';
import prisma from '../prisma/prisma';
import { NotFoundException, AccessDeniedException, HttpException } from '../utils/errors.utils';
import {
  createChangeJsonDates,
  createChangeJsonNonList,
  createDependenciesChangesJson,
  createDescriptionBulletChangesJson
} from '../utils/work-packages.utils';
import { addDescriptionBullets, editDescriptionBullets } from '../utils/projects.utils';
import { descBulletConverter } from '../utils/utils';
import { getUserFullName } from '../utils/users.utils';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import workPackageTransformer from '../transformers/work-packages.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';

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
   * @param startDate the date string representing the start date
   * @param duration the expected duration of this work package, in weeks
   * @param dependencies the WBS elements that need to be completed before this WP
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
    startDate: string,
    duration: number,
    dependencies: WBS_Element[],
    expectedActivities: string[],
    deliverables: string[]
  ): Promise<string> {
    if (user.role === Role.GUEST) throw new AccessDeniedException();

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

    if (dependencies.find((dep: WBS_Element) => equalsWbsNumber(dep, projectWbsNum))) {
      throw new HttpException(400, 'A Work Package cannot have its own project as a dependency');
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
            workPackages: { include: { wbsElement: true, dependencies: true } }
          }
        }
      }
    });

    if (!wbsElem) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElem.dateDeleted) throw new HttpException(400, 'Cannot create a work package for a deleted project!');

    const { project } = wbsElem;

    if (!project) throw new NotFoundException('Project', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    const { projectId } = project;

    const newWorkPackageNumber: number =
      project.workPackages
        .map((element) => element.wbsElement.workPackageNumber)
        .reduce((prev, curr) => Math.max(prev, curr), 0) + 1;

    const dependenciesWBSElems: (WBS_Element | null)[] = await Promise.all(
      dependencies.map(async (ele: WBS_Element) => {
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

    const dependenciesIds: number[] = [];
    // populate dependenciesIds with the element ID's
    // and return error 400 if any elems are null

    let dependenciesHasNulls = false;
    dependenciesWBSElems.forEach((elem) => {
      if (elem === null) {
        dependenciesHasNulls = true;
        return;
      }
      dependenciesIds.push(elem.wbsElementId);
    });

    if (dependenciesHasNulls) {
      throw new HttpException(400, 'One of the dependencies was not found.');
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
        project: { connect: { projectId } },
        startDate: date,
        duration,
        orderInProject: project.workPackages.length + 1,
        dependencies: { connect: dependenciesIds.map((ele) => ({ wbsElementId: ele })) },
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
   * @param dependencies the new WBS elements to be completed before this WP
   * @param expectedActivities the new expected activities descriptions for this WP
   * @param deliverables the new expected deliverables descriptions for this WP
   * @param WbsElementStatus the new status for this work package
   * @param projectLead the new lead for this work package
   * @param projectManager the new manager for this work package
   */
  static async editWorkPackage(
    user: User,
    workPackageId: number,
    name: string,
    crId: number,
    startDate: string,
    duration: number,
    dependencies: WBS_Element[],
    expectedActivities: DescriptionBullet[],
    deliverables: DescriptionBullet[],
    wbsElementStatus: WbsElementStatus,
    projectLead: number,
    projectManager: number
  ): Promise<void> {
    // verify user is allowed to edit work packages
    if (user.role === Role.GUEST) throw new AccessDeniedException();

    const { userId } = user;

    // get the original work package so we can compare things
    const originalWorkPackage = await prisma.work_Package.findUnique({
      where: { workPackageId },
      include: {
        wbsElement: true,
        dependencies: true,
        expectedActivities: true,
        deliverables: true
      }
    });

    if (!originalWorkPackage) throw new NotFoundException('Work Package', workPackageId);
    if (originalWorkPackage.wbsElement.dateDeleted) throw new HttpException(400, 'Cannot edit a deleted work package!');

    if (
      dependencies.find((dep: WBS_Element) =>
        equalsWbsNumber(dep, {
          carNumber: originalWorkPackage.wbsElement.carNumber,
          projectNumber: originalWorkPackage.wbsElement.projectNumber,
          workPackageNumber: 0
        })
      ) != null
    ) {
      throw new HttpException(400, 'A Work Package cannot have own project as a dependency');
    }

    if (
      dependencies.find((dep: WBS_Element) =>
        equalsWbsNumber(dep, {
          carNumber: originalWorkPackage.wbsElement.carNumber,
          projectNumber: originalWorkPackage.wbsElement.projectNumber,
          workPackageNumber: originalWorkPackage.wbsElement.workPackageNumber
        })
      ) != null
    ) {
      throw new HttpException(400, 'A Work Package cannot have own project as a dependency');
    }

    // the crId must match a valid approved change request
    await validateChangeRequestAccepted(crId);

    const depsIds = await Promise.all(
      dependencies.map(async (wbsNum: WbsNumber) => {
        const { carNumber, projectNumber, workPackageNumber } = wbsNum;
        const wbsElem = await prisma.wBS_Element.findUnique({
          where: {
            wbsNumber: { carNumber, projectNumber, workPackageNumber }
          }
        });

        if (!wbsElem) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
        if (wbsElem.dateDeleted) throw new HttpException(400, `WBS ${wbsPipe(wbsNum)} has been deleted!`);

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
    const wbsElementStatusChangeJson = createChangeJsonNonList(
      'status',
      originalWorkPackage.wbsElement.status,
      wbsElementStatus,
      crId,
      userId,
      wbsElementId!
    );
    const dependenciesChangeJson = await createDependenciesChangesJson(
      originalWorkPackage.dependencies.map((element) => element.wbsElementId),
      depsIds.map((elem) => elem as number),
      crId,
      userId,
      wbsElementId!,
      'dependency'
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
    if (wbsElementStatusChangeJson !== undefined) changes.push(wbsElementStatusChangeJson);

    if (projectManager === undefined) {
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
    }

    if (projectLead === undefined) {
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
    }

    // add the changes for each of dependencies, expected activities, and deliverables
    changes = changes
      .concat(dependenciesChangeJson)
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
            status: wbsElementStatus,
            projectLeadId: projectLead,
            projectManagerId: projectManager
          }
        },
        dependencies: {
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
}
