import { Description_Bullet, WBS_Element, Work_Package_Template } from '@prisma/client';
import prisma from '../prisma/prisma.js';
import { HttpException, NotFoundException } from './errors.utils.js';
import { WbsNumber, User } from 'shared';

export const calculateWorkPackageProgress = (
  deliverables: Description_Bullet[],
  expectedActivities: Description_Bullet[]
) => {
  const bullets = deliverables.concat(expectedActivities);
  return bullets.length === 0 ? 0 : Math.floor((bullets.filter((b) => b.dateTimeChecked).length / bullets.length) * 100);
};

/**
 * Gets the wbs element ids of every work package transitively blocked by the given work package, nearest first.
 * Walks one level of the blocking chain per query, so the cost follows the chain's depth rather than the org's size.
 * Deleted work packages are skipped and not walked past. A chain that loops back to the start just stops there.
 * @param initialWbsElementId the wbs element id of the work package to start from
 * @param organizationId the organization the work package belongs to
 * @returns the wbs element ids of the blocked work packages, in the order the walk reached them
 */
export const getBlockingWorkPackages = async (initialWbsElementId: string, organizationId: string): Promise<string[]> => {
  const seenWbsElementIds = new Set<string>([initialWbsElementId]);
  const blockingWbsElementIds: string[] = [];
  let level: string[] = [initialWbsElementId];

  while (level.length > 0) {
    const elements = await prisma.wBS_Element.findMany({
      where: { wbsElementId: { in: level }, organizationId },
      select: { wbsElementId: true, dateDeleted: true, blocking: { select: { wbsElementId: true } } }
    });
    // keep the level's order: findMany with `in` doesn't
    const elementsById = new Map(elements.map((element) => [element.wbsElementId, element]));

    const nextLevel: string[] = [];
    for (const wbsElementId of level) {
      const element = elementsById.get(wbsElementId);
      if (!element || element.dateDeleted) continue;
      if (wbsElementId !== initialWbsElementId) blockingWbsElementIds.push(wbsElementId);

      for (const { wbsElementId: blockedId } of element.blocking) {
        if (seenWbsElementIds.has(blockedId)) continue;
        seenWbsElementIds.add(blockedId);
        nextLevel.push(blockedId);
      }
    }
    level = nextLevel;
  }

  return blockingWbsElementIds;
};

interface WorkPackageTemplateWithBlocking extends Work_Package_Template {
  blocking: Work_Package_Template[];
}

export const deleteBlockingTemplates = async (workPackageTemplate: WorkPackageTemplateWithBlocking, submitter: User) => {
  const seenWorkPackageTemplateIds: Set<string> = new Set<string>(workPackageTemplate.wbsElementTemplateId);

  // blocking ids that still need to be updated
  const blockingIdUpdateQueue: string[] = workPackageTemplate.blocking.map(
    (blocking: Work_Package_Template) => blocking.wbsElementTemplateId
  );

  while (blockingIdUpdateQueue.length > 0) {
    const currentBlockingId = blockingIdUpdateQueue.pop();

    if (!currentBlockingId) break;
    if (seenWorkPackageTemplateIds.has(currentBlockingId)) continue; // if we've already seen it we skip it

    seenWorkPackageTemplateIds.add(currentBlockingId);

    // gets the current blocking work package template
    const currentBlocking = await prisma.work_Package_Template.findUnique({
      where: {
        wbsElementTemplateId: currentBlockingId
      },
      include: {
        blocking: true,
        wbsElementTemplate: true
      }
    });

    if (currentBlocking?.wbsElementTemplateId === workPackageTemplate.wbsElementTemplateId) {
      throw new HttpException(400, 'Circular dependency detected');
    }

    if (!currentBlocking) throw new NotFoundException('Work Package Template', currentBlockingId);
    if (currentBlocking.wbsElementTemplate.dateDeleted) continue; // skip if this work package template has been deleted
    const newBlocking: string[] = currentBlocking.blocking.map((blocking) => blocking.wbsElementTemplateId);
    blockingIdUpdateQueue.push(...newBlocking);

    const dateDeleted = new Date();

    // delete the work package template
    await prisma.work_Package_Template.update({
      where: {
        wbsElementTemplateId: currentBlockingId
      },
      data: {
        wbsElementTemplate: {
          update: {
            dateDeleted,
            userDeleted: {
              connect: {
                userId: submitter.userId
              }
            }
          }
        }
      }
    });
  }
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
      wbsElementTemplateId: {
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
