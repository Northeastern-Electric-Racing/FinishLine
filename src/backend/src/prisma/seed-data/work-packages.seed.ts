/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma, User } from '@prisma/client';
import { validateWBS, WbsElementStatus, WbsNumber } from 'shared';
import { WorkPackageStage } from 'shared';
import workPackageQueryArgs from '../../prisma-query-args/work-packages.query-args';
import WorkPackagesService from '../../services/work-packages.services';
import prisma from '../prisma';
import { descBulletConverter } from '../../utils/description-bullets.utils';

/**
 * Creates a work package with the given data using service functions. This has to be done by:
 * 1) creating the work package
 * 2) editing the work package
 */
export const seedWorkPackage = async (
  creator: User,
  name: string,
  changeRequestId: number,
  stage: WorkPackageStage | null,
  startDate: string,
  duration: number,
  blockedBy: WbsNumber[],
  expectedActivities: string[],
  deliverables: string[],
  editor: User,
  status: WbsElementStatus,
  projectLead: number,
  projectManager: number
): Promise<{
  workPackageWbsNumber: WbsNumber;
  workPackage: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>;
}> => {
  const workPackage1WbsString = await WorkPackagesService.createWorkPackage(
    creator,
    name,
    changeRequestId,
    stage,
    startDate,
    duration,
    blockedBy,
    expectedActivities,
    deliverables
  );

  const workPackageWbsNumber = validateWBS(workPackage1WbsString);

  const workPackage = await prisma.work_Package.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: workPackageWbsNumber.carNumber,
        projectNumber: workPackageWbsNumber.projectNumber,
        workPackageNumber: workPackageWbsNumber.workPackageNumber
      }
    },
    ...workPackageQueryArgs
  });

  await WorkPackagesService.editWorkPackage(
    editor,
    workPackage.workPackageId,
    workPackage.wbsElement.name,
    changeRequestId,
    stage,
    workPackage.startDate.toString(),
    workPackage.duration,
    workPackage.blockedBy,
    workPackage.expectedActivities.map(descBulletConverter),
    workPackage.deliverables.map(descBulletConverter),
    projectLead,
    projectManager
  );

  return { workPackageWbsNumber, workPackage };
};
