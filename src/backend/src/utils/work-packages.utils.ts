import { Description_Bullet, Prisma, WBS_Element, Work_Package_Template } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException, NotFoundException } from './errors.utils';
import { WbsNumber } from 'shared';
import { WorkPackageQueryArgs, getWorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';

export const calculateWorkPackageProgress = (
  deliverables: Description_Bullet[],
  expectedActivities: Description_Bullet[]
) => {
  const bullets = deliverables.concat(expectedActivities);
  return bullets.length === 0 ? 0 : Math.floor((bullets.filter((b) => b.dateTimeChecked).length / bullets.length) * 100);
};

/**
 * Gets all the work packages the given work package is blocking
 * @param initialWorkPackage the work package to get the blocking work packages for
 * @returns an array of the blocking work packages
 */
export const getBlockingWorkPackages = async (initialWorkPackage: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>) => {
  // track the wbs element ids we've seen so far so we don't update the same one multiple times
  const seenWbsElementIds: Set<string> = new Set<string>([initialWorkPackage.wbsElement.wbsElementId]);

  // blocking ids that still need to be updated
  const blockingUpdateQueue: string[] = initialWorkPackage.wbsElement.blocking.map((blocking) => blocking.wbsElementId);
  const blockingWorkPackages: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>[] = [];
  while (blockingUpdateQueue.length > 0) {
    const currWbsId = blockingUpdateQueue.pop(); // get the next blocking and remove it from the queue

    if (!currWbsId) break; // this is more of a type check for pop becuase the while loop prevents this from not existing
    if (seenWbsElementIds.has(currWbsId)) continue; // if we've already seen it we skip it

    seenWbsElementIds.add(currWbsId);

    // get the current wbs object from prisma
    const currWbs = await prisma.wBS_Element.findUnique({
      where: { wbsElementId: currWbsId },
      include: {
        blocking: true,
        workPackage: { ...getWorkPackageQueryArgs(initialWorkPackage.wbsElement.organizationId) }
      }
    });

    if (currWbs?.wbsElementId === initialWorkPackage.wbsElementId)
      throw new HttpException(400, 'Circular dependency detected');

    if (!currWbs) throw new NotFoundException('WBS Element', currWbsId);
    if (currWbs.dateDeleted) continue; // this wbs element has been deleted so skip it
    if (!currWbs.workPackage) continue; // this wbs element is a project so skip it

    // get all the blockings of the current wbs and add them to the queue to update
    const newBlocking: string[] = currWbs.blocking.map((blocking) => blocking.wbsElementId);
    blockingUpdateQueue.push(...newBlocking);
    blockingWorkPackages.push(currWbs.workPackage);
  }

  return blockingWorkPackages;
};

export const validateBlockedBys = async (blockedBy: WbsNumber[], organizationId: string): Promise<WBS_Element[]> => {
  blockedBy.forEach((dep: WbsNumber) => {
    if (dep.workPackageNumber === 0) {
      throw new HttpException(400, 'A Project cannot be a Blocker');
    }
  });

  const blockedByWBSElems: (WBS_Element | null)[] = await Promise.all(
    blockedBy.map(async (ele: WbsNumber) => {
      return await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: ele.carNumber,
            projectNumber: ele.projectNumber,
            workPackageNumber: ele.workPackageNumber,
            organizationId
          }
        }
      });
    })
  );

  // populate blockedByIds with the element ID's
  // and return error 400 if any elems are null
  const blockedByIds: WBS_Element[] = [];

  blockedByWBSElems.forEach((elem) => {
    if (!elem) {
      throw new HttpException(400, 'One of the blockers was not found.');
    } else {
      blockedByIds.push(elem);
    }
  });

  return blockedByIds;
};

export const validateBlockedByTemplates = async (
  blockedByIds: string[],
  originalTemplateId: string
): Promise<Work_Package_Template[]> => {
  const blockedByTemplates = await prisma.work_Package_Template.findMany({
    where: {
      workPackageTemplateId: {
        in: blockedByIds
      }
    }
  });

  if (blockedByTemplates.length !== blockedByIds.length) {
    throw new HttpException(400, 'One of the blockers is not a Work Package Template.');
  }

  if (blockedByIds.includes(originalTemplateId)) {
    throw new HttpException(400, 'A Work Package Template cannot block itself.');
  }

  return blockedByTemplates;
};
