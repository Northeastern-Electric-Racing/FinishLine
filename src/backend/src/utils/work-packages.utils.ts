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
 * Gets the wbs element ids of every work package transitively blocked by the given work package.
 * Loads the organization's blocking edges in one query and walks them in memory, rather than one query per node.
 * @param initialWbsElementId the wbs element id of the work package to start from
 * @param organizationId the organization the work package belongs to
 * @returns the wbs element ids of the blocked work packages (deleted ones are skipped)
 * @throws if the blocking chain loops back to the initial work package
 */
export const getBlockingWorkPackages = async (initialWbsElementId: string, organizationId: string): Promise<string[]> => {
  // the blocking relation only ever points at work packages, so that's all the walk can reach
  const elements = await prisma.wBS_Element.findMany({
    where: { organizationId, workPackage: { isNot: null } },
    select: { wbsElementId: true, dateDeleted: true, blocking: { select: { wbsElementId: true } } }
  });
  const elementsById = new Map(elements.map((element) => [element.wbsElementId, element]));

  const initial = elementsById.get(initialWbsElementId);
  if (!initial) throw new NotFoundException('WBS Element', initialWbsElementId);

  const seenWbsElementIds = new Set<string>([initialWbsElementId]);
  const queue: string[] = initial.blocking.map((blocking) => blocking.wbsElementId);
  const blockingWbsElementIds: string[] = [];

  while (queue.length > 0) {
    const currWbsId = queue.pop();
    if (!currWbsId) break;
    if (currWbsId === initialWbsElementId) throw new HttpException(400, 'Circular dependency detected');
    if (seenWbsElementIds.has(currWbsId)) continue;
    seenWbsElementIds.add(currWbsId);

    const currWbs = elementsById.get(currWbsId);
    if (!currWbs) throw new NotFoundException('WBS Element', currWbsId);
    if (currWbs.dateDeleted) continue; // this wbs element has been deleted so skip it

    queue.push(...currWbs.blocking.map((blocking) => blocking.wbsElementId));
    blockingWbsElementIds.push(currWbsId);
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
