import { Organization, Prisma, WBS_Element, WBS_Element_Status } from '@prisma/client';
import {
  calculateEndDate,
  DescriptionBulletPreview,
  getDay,
  isAdmin,
  isGuest,
  isWorkPackageWbs,
  BaseWorkPackage,
  WbsElementStatus,
  WbsNumber,
  wbsPipe,
  WorkPackageCard,
  WorkPackageDetail,
  WorkPackageStage,
  User,
  WorkPackageSelection,
  WorkPackageDropdownItem,
  WorkPackageTimelineFilters,
  isWithinBuffer
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  NotFoundException,
  HttpException,
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException
} from '../utils/errors.utils.js';
import {
  getBaseWorkPackageQueryArgs,
  getWorkPackageCardQueryArgs,
  getWorkPackageDetailQueryArgs
} from '../prisma-query-args/work-packages.query-args.js';
import { getWorkPackageDropdownQueryArgs } from '../prisma-query-args/dropdown.query-args.js';
import {
  baseWorkPackageTransformer,
  workPackageCardTransformer,
  workPackageDetailTransformer
} from '../transformers/work-packages.transformer.js';
import { workPackageDropdownTransformer } from '../transformers/dropdown.transformer.js';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils.js';
import { sendSlackUpcomingDeadlineNotification } from '../utils/slack.utils.js';
import { getWorkPackageChanges } from '../utils/changes.utils.js';
import {
  DescriptionBulletDestination,
  addRawDescriptionBullets,
  editDescriptionBullets
} from '../utils/description-bullets.utils.js';
import { getBlockingWorkPackages, validateBlockedBys } from '../utils/work-packages.utils.js';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args.js';
import { userHasPermission } from '../utils/users.utils.js';
import { sendMessage } from '../integrations/slack.js';

/**
 * Throws a 404 unless the wbs number is a work package's (not a car's or project's)
 * @param wbsNum the wbs number to check
 */
const validateWorkPackageWbs = (wbsNum: WbsNumber) => {
  if (!isWorkPackageWbs(wbsNum)) throw new HttpException(404, `WBS Number ${wbsPipe(wbsNum)} is not a work package WBS#`);
};

/** Service layer containing logic for work package controller functions. */
export default class WorkPackagesService {
  /**
   * Retrieve all work packages as the base model (enough for dropdowns and lists).
   *
   * @param status Optional status filter
   * @param organization the organization
   * @param carId the car number to filter by (only returns work packages from this car when provided)
   * @returns the work packages, as the base model
   */
  static async getAllWorkPackages(
    status: WbsElementStatus | string | undefined,
    organization: Organization,
    carId?: string
  ): Promise<BaseWorkPackage[]> {
    const workPackages = await prisma.work_Package.findMany({
      where: {
        wbsElement: {
          dateDeleted: null,
          organizationId: organization.organizationId,
          ...(status ? { status: status as WbsElementStatus } : {})
        },
        ...(carId && { project: { carId } })
      },
      ...getBaseWorkPackageQueryArgs()
    });

    return workPackages.map(baseWorkPackageTransformer);
  }

  /**
   * Gets a minimal list of work packages for use in dropdowns (id + name + wbsNum + projectName only).
   * @param organization the organization the user is in
   * @returns the work packages for a dropdown
   */
  static async getAllWorkPackagesDropdown(organization: Organization): Promise<WorkPackageDropdownItem[]> {
    const workPackages = await prisma.work_Package.findMany({
      where: { wbsElement: { dateDeleted: null, organizationId: organization.organizationId } },
      ...getWorkPackageDropdownQueryArgs()
    });

    return workPackages.map(workPackageDropdownTransformer);
  }

  /**
   * Retrieve the work package with the specified WBS number.
   * @param parsedWbs the WBS number of the desired work package
   * @param organizationId the id of the organization that the user is currently in
   * @returns the desired work package
   * @throws if the work package with the desired WBS number is not found, is deleted or is not part of the given organization
   */
  static async getSingleWorkPackage(parsedWbs: WbsNumber, organization: Organization): Promise<WorkPackageDetail> {
    validateWorkPackageWbs(parsedWbs);

    // wbs numbers are only unique within an organization, so the lookup is scoped to it
    const wp = await prisma.work_Package.findFirst({
      where: {
        wbsElement: {
          dateDeleted: null,
          carNumber: parsedWbs.carNumber,
          projectNumber: parsedWbs.projectNumber,
          workPackageNumber: parsedWbs.workPackageNumber,
          organizationId: organization.organizationId
        }
      },
      ...getWorkPackageDetailQueryArgs()
    });

    if (!wp)
      throw new NotFoundException(
        'Work Package',
        `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}`
      );

    return workPackageDetailTransformer(wp);
  }

  /**
   * Retrieve a subset of work packages.
   * @param wbsNums the WBS numbers of the work packages to retrieve
   * @param organizationId the id of the organization that the user is currently in
   * @param carId optional car number to filter work packages by
   * @returns the work packages with the given WBS numbers
   * @throws if any of the work packages are not found or are not part of the organization
   */
  static async getManyWorkPackages(wbsNums: WbsNumber[], organization: Organization): Promise<BaseWorkPackage[]> {
    wbsNums.forEach(validateWorkPackageWbs);

    const whereConditions = wbsNums.map((wbsNum) => ({
      wbsElement: {
        carNumber: wbsNum.carNumber,
        projectNumber: wbsNum.projectNumber,
        workPackageNumber: wbsNum.workPackageNumber,
        organizationId: organization.organizationId,
        dateDeleted: null
      }
    }));

    const workPackages = await prisma.work_Package.findMany({
      where: {
        OR: whereConditions
      },
      ...getBaseWorkPackageQueryArgs()
    });

    return workPackages.map(baseWorkPackageTransformer);
  }

  /**
   * Retrieve all work packages for a given project
   * @param projectWbsNum the wbs number of the project
   * @param organization the organization that the user is currently in
   * @returns the work packages for the given project
   * @throws if the project does not exist or is deleted
   */
  static async getWorkPackagesByProject(projectWbsNum: WbsNumber, organization: Organization): Promise<BaseWorkPackage[]> {
    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber: projectWbsNum.carNumber,
          projectNumber: projectWbsNum.projectNumber,
          workPackageNumber: 0,
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      },
      select: { projectId: true }
    });

    if (!project) throw new NotFoundException('Project', wbsPipe(projectWbsNum));

    const workPackages = await prisma.work_Package.findMany({
      where: {
        projectId: project.projectId,
        wbsElement: { dateDeleted: null }
      },
      ...getBaseWorkPackageQueryArgs()
    });

    return workPackages.map(baseWorkPackageTransformer);
  }

  /**
   *
   */
  static async sendWorkPackageDeadlineNotifications() {
    const currDay = new Date();
    const workPackages = await prisma.work_Package.findMany({
      where: {
        wbsElement: { dateDeleted: null }
      },
      include: {
        project: { include: { teams: true } },
        wbsElement: { include: { lead: true, manager: true } }
      }
    });

    for (const workPackage of workPackages) {
      const startDateIsADayApart = isWithinBuffer(currDay, workPackage.startDate, 1);
      const startDateInactive = startDateIsADayApart && workPackage.wbsElement.status === WBS_Element_Status.INACTIVE;

      const endDateIsADayApart = isWithinBuffer(currDay, calculateEndDate(workPackage.startDate, workPackage.duration), 1);
      const endDateNotComplete = endDateIsADayApart && workPackage.wbsElement.status !== WBS_Element_Status.COMPLETE;

      const leadIdString = workPackage.wbsElement.leadId || '';
      const managerIdString = workPackage.wbsElement.managerId || '';

      const link = `https://finishlinebyner.com/wp/${workPackage}`;
      const linkButtonText = `View WP#${workPackage.projectId}`;

      const { teams } = workPackage.project;

      if (startDateInactive) {
        const dateRelation = WorkPackagesService.GetBeforeNowOrAfter(currDay, workPackage.startDate);
        const startDateMessage =
          'The work package, ' + workPackage.projectId + ' , is still inactive ' + dateRelation + ' the start date';
        const message = leadIdString + ' ' + managerIdString + ' ' + startDateMessage;
        teams.map((team) => sendMessage(team.slackId, message, link, linkButtonText));
      }
      if (endDateNotComplete) {
        const dateRelation = WorkPackagesService.GetBeforeNowOrAfter(
          currDay,
          calculateEndDate(workPackage.startDate, workPackage.duration)
        );
        const endDateMessage =
          'The work package, ' + workPackage.projectId + ' , is still not complete ' + dateRelation + ' the end date';
        const message = leadIdString + ' ' + managerIdString + ' ' + endDateMessage;
        teams.map((team) => sendMessage(team.slackId, message, link, linkButtonText));
      }
    }
  }

  /**
   * Returns a string that states whether the currDay is before, after, or on the same day as the comparisonDate
   * @param currDay The date being compared with the workpackage start/end Date.
   * @param comparisonDate given date to compare with
   * @returns A string that states whether the given currDay is before / after / same day as the comparisonDate
   */
  private static GetBeforeNowOrAfter(currDay: Date, comparisonDate: Date) {
    if (isWithinBuffer(currDay, comparisonDate, 0)) {
      return 'same day';
    }

    const currUtc = Date.UTC(currDay.getFullYear(), currDay.getMonth(), currDay.getDate());
    const comparisonUtc = Date.UTC(comparisonDate.getFullYear(), comparisonDate.getMonth(), comparisonDate.getDate());

    if (currUtc > comparisonUtc) {
      return 'one day after';
    }

    return 'one day before';
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
    crId: string | null,
    stage: WorkPackageStage | null,
    startDate: string,
    duration: number,
    blockedBy: WbsNumber[],
    descriptionBullets: DescriptionBulletPreview[],
    projectWbsNum: WbsNumber,
    organization: Organization
  ): Promise<BaseWorkPackage> {
    if (await userHasPermission(user.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create work packages');

    if (crId) {
      await validateChangeRequestAccepted(crId);
    }

    const blockedByElements: WBS_Element[] = await validateBlockedBys(blockedBy, organization.organizationId);

    // get the corresponding project so we can find the next wbs number
    // and what number work package this should be
    const { carNumber, projectNumber } = projectWbsNum;

    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      },
      select: {
        projectId: true,
        workPackages: { select: { wbsElement: { select: { workPackageNumber: true, dateDeleted: true } } } },
        wbsElement: { select: { leadId: true, managerId: true } }
      }
    });

    if (!project) {
      throw new NotFoundException('Project', `${carNumber}.${projectNumber}.0`);
    }

    const { projectId } = project;

    const { leadId, managerId } = project.wbsElement;

    const newWorkPackageNumber: number =
      project.workPackages
        .map((element) => element.wbsElement.workPackageNumber)
        .reduce((prev, curr) => Math.max(prev, curr), 0) + 1;

    const changesToCreate = crId
      ? [
          {
            changeRequestId: crId,
            implementerId: user.userId,
            detail: 'New Work Package Created'
          }
        ]
      : [];

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
              createMany: { data: changesToCreate }
            },
            organizationId: organization.organizationId,
            leadId,
            managerId
          }
        },
        stage,
        project: { connect: { projectId } },
        startDate: new Date(startDate),
        duration,
        orderInProject: project.workPackages.filter((wp) => !wp.wbsElement.dateDeleted).length + 1,
        blockedBy: { connect: blockedByElements.map((ele) => ({ wbsElementId: ele.wbsElementId })) }
      },
      // the project form reads the created wbs number to wire up blockers between new work packages
      ...getBaseWorkPackageQueryArgs()
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
      leadId,
      null,
      managerId,
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
      created.wbsElementId,
      organization.organizationId
    );

    await prisma.change.createMany({ data: changes.changes });

    return baseWorkPackageTransformer(created);
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
    organization: Organization
  ): Promise<void> {
    const { userId } = user;
    // verify user is allowed to edit work packages
    if (await userHasPermission(userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('edit work packages');

    // get the original work package so we can compare things
    const originalWorkPackage = await prisma.work_Package.findFirst({
      where: { workPackageId, wbsElement: { dateDeleted: null, organizationId: organization.organizationId } },
      select: {
        wbsElementId: true,
        stage: true,
        startDate: true,
        duration: true,
        wbsElement: {
          select: {
            name: true,
            status: true,
            // the old lead and manager go into the change log
            leadId: true,
            managerId: true,
            descriptionBullets: getDescriptionBulletQueryArgs(organization.organizationId)
          }
        },
        blockedBy: true
      }
    });

    if (!originalWorkPackage) throw new NotFoundException('Work Package', workPackageId);

    // the crId must match a valid approved change request
    await validateChangeRequestAccepted(crId);

    const { wbsElementId } = originalWorkPackage;

    const blockedByElems = await validateBlockedBys(blockedBy, organization.organizationId);

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
      originalWorkPackage.wbsElement.leadId,
      leadId,
      originalWorkPackage.wbsElement.managerId,
      managerId,
      originalWorkPackage.wbsElement.descriptionBullets,
      descriptionBullets,
      crId,
      wbsElementId,
      userId
    );

    // set the status of the wbs element to active if an edit is made to a completed version
    const status =
      originalWorkPackage.wbsElement.status === WbsElementStatus.Complete
        ? WbsElementStatus.Active
        : originalWorkPackage.wbsElement.status;

    // update the work package with the input fields
    await prisma.work_Package.update({
      where: { wbsElementId },
      data: {
        startDate: new Date(startDate),
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
      }
    });

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
      organization.organizationId
    );

    // edit the expected changes and deliverables
    await editDescriptionBullets(changes.editedDescriptionBullets, organization.organizationId);

    // create the changes in prisma
    await prisma.change.createMany({ data: changes.changes });
  }

  /**
   * Deletes the Work Package
   * @param submitter The user who deleted the work package
   * @param wbsNum The work package number to be deleted
   * @param organizationId The organization id that the user is in
   */
  static async deleteWorkPackage(submitter: User, wbsNum: WbsNumber, organization: Organization): Promise<void> {
    // Verify submitter is allowed to delete work packages
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete work packages');

    validateWorkPackageWbs(wbsNum);

    const workPackage = await prisma.work_Package.findFirst({
      where: { wbsElement: { ...wbsNum, organizationId: organization.organizationId, dateDeleted: null } },
      select: { workPackageId: true, wbsElementId: true }
    });

    if (!workPackage) throw new NotFoundException('Work Package', wbsPipe(wbsNum));

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
   * @param carId the optional carId to filter work packages by
   * @returns the blocking work packages for the given work package
   */
  static async getBlockingWorkPackages(wbsNum: WbsNumber, organization: Organization): Promise<BaseWorkPackage[]> {
    const { carNumber, projectNumber, workPackageNumber } = wbsNum;

    // is a project or car so just return empty array until we implement blocking projects/cars
    if (!isWorkPackageWbs(wbsNum)) return [];

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId: organization.organizationId
        }
      },
      select: { wbsElementId: true, dateDeleted: true, workPackage: { select: { workPackageId: true } } }
    });

    if (!wbsElement?.workPackage) throw new NotFoundException('Work Package', wbsPipe(wbsNum));
    if (wbsElement.dateDeleted) throw new DeletedException('Work Package', wbsElement.wbsElementId);

    const blockingWbsElementIds = await getBlockingWorkPackages(wbsElement.wbsElementId, organization.organizationId);

    const blockingWorkPackages = await prisma.work_Package.findMany({
      where: { wbsElementId: { in: blockingWbsElementIds } },
      ...getBaseWorkPackageQueryArgs()
    });
    // nearest blocked first, as the walk found them
    const walkOrder = new Map(blockingWbsElementIds.map((wbsElementId, index) => [wbsElementId, index]));
    return blockingWorkPackages
      .sort((a, b) => (walkOrder.get(a.wbsElementId) ?? 0) - (walkOrder.get(b.wbsElementId) ?? 0))
      .map(baseWorkPackageTransformer);
  }

  /**
   * Send a slack message to the project lead of each work package telling them when their work package is due.
   * Sends a message for every work package that is due before or on the given deadline (even before today)
   * @param user - the user doing the sending
   * @param deadline - the deadline
   * @param organization - the organization that the user is currently in
   * @returns void, once every message has been sent
   */
  static async slackMessageUpcomingDeadlines(user: User, deadline: Date, organization: Organization): Promise<void> {
    const upcomingWorkPackages = await WorkPackagesService.getUpcomingDeadlineWorkPackages(user, deadline, organization);
    await WorkPackagesService.sendUpcomingDeadlineNotifications(upcomingWorkPackages);
  }

  /**
   * Gets the active work packages due on or before the deadline, soonest first. Split from sending so the endpoint
   * can check access and reply before the slow, rate-limited send loop runs
   * @param user - the user doing the sending; must be an admin
   * @param deadline - the deadline
   * @param organization - the organization that the user is currently in
   */
  static async getUpcomingDeadlineWorkPackages(user: User, deadline: Date, organization: Organization) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('send the upcoming deadlines slack messages');

    const workPackages = await prisma.work_Package.findMany({
      where: {
        wbsElement: { dateDeleted: null, status: WBS_Element_Status.ACTIVE, organizationId: organization.organizationId }
      },
      select: {
        ...getBaseWorkPackageQueryArgs().select,
        // each project team's channel gets the reminder
        project: { select: { wbsElement: { select: { name: true } }, teams: { select: { slackId: true } } } }
      }
    });

    return workPackages
      .filter((wp) => getDay(calculateEndDate(wp.startDate, wp.duration)) <= getDay(deadline))
      .sort(
        (a, b) => calculateEndDate(a.startDate, a.duration).getTime() - calculateEndDate(b.startDate, b.duration).getTime()
      );
  }

  /**
   * Sends the upcoming deadline slack message for each work package, one at a time with a 2 second gap for slack's rate limit
   * @param workPackages - the work packages from getUpcomingDeadlineWorkPackages
   */
  static async sendUpcomingDeadlineNotifications(
    workPackages: Awaited<ReturnType<typeof WorkPackagesService.getUpcomingDeadlineWorkPackages>>
  ): Promise<void> {
    for (const workPackage of workPackages) {
      await sendSlackUpcomingDeadlineNotification(workPackage);
      await new Promise((callBack) => setTimeout(callBack, 2000));
    }
  }

  /**
   * Gets the work packages for the home page widgets: whose they are comes from the selection, when they run from the filters
   *
   * @param user The current user
   * @param organization The organization the current user is logged in for
   * @param selection Whose work packages: everyone's, the teams the user leads, or the teams the user is on
   * @param filters Inclusive start / end date bounds and a status; complete work packages are left out unless a status is given
   * @param carId Optional car number to filter work packages by
   */
  static async getHomePageWorkPackages(
    user: User,
    organization: Organization,
    selection: WorkPackageSelection,
    filters: WorkPackageTimelineFilters,
    carId?: string
  ): Promise<WorkPackageCard[]> {
    const { startsAfter, startsBefore, endsAfter, endsBefore, status } = filters;
    // a work package can't end before it starts, so an end bound also caps the start date the database can filter on
    const startDateCaps = [startsBefore, endsBefore].filter((date): date is Date => date !== undefined);
    const latestStart = startDateCaps.length > 0 ? new Date(Math.min(...startDateCaps.map((d) => d.getTime()))) : undefined;

    const selectionArgs =
      selection === WorkPackageSelection.ALL
        ? {}
        : selection === WorkPackageSelection.LEADING
          ? {
              workPackage: {
                project: {
                  teams: { some: { OR: [{ headId: user.userId }, { leads: { some: { userId: user.userId } } }] } }
                }
              }
            }
          : {
              workPackage: {
                project: {
                  teams: {
                    some: {
                      OR: [
                        { headId: user.userId },
                        { leads: { some: { userId: user.userId } } },
                        { members: { some: { userId: user.userId } } }
                      ]
                    }
                  }
                }
              }
            };

    const where: Prisma.Work_PackageWhereInput = {
      wbsElement: {
        ...selectionArgs,
        dateDeleted: null,
        organizationId: organization.organizationId,
        status: status ? (status as WBS_Element_Status) : { not: WBS_Element_Status.COMPLETE }
      },
      ...(carId && { project: { carId } }),
      startDate: { gte: startsAfter, lte: latestStart }
    };

    if (!endsAfter && !endsBefore) {
      const workPackages = await prisma.work_Package.findMany({ where, ...getWorkPackageCardQueryArgs() });
      return workPackages.map(workPackageCardTransformer);
    }

    // the end date isn't stored (it's start + duration), so the database can't filter on it. Check it against just the
    // dates first, then fetch the full cards (blockers and all) only for the work packages that make it through
    const candidates = await prisma.work_Package.findMany({
      where,
      select: { workPackageId: true, startDate: true, duration: true }
    });
    const matchingIds = candidates
      .filter(({ startDate, duration }) => {
        const endDate = calculateEndDate(startDate, duration);
        return (!endsAfter || endDate >= endsAfter) && (!endsBefore || endDate <= endsBefore);
      })
      .map(({ workPackageId }) => workPackageId);
    if (matchingIds.length === 0) return [];

    const workPackages = await prisma.work_Package.findMany({
      where: { workPackageId: { in: matchingIds } },
      ...getWorkPackageCardQueryArgs()
    });
    return workPackages.map(workPackageCardTransformer);
  }
}
