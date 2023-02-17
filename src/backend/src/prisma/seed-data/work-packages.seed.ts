/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma, User, Work_Package_Stage } from '@prisma/client';
import { validateWBS, WbsElementStatus, WbsNumber } from 'shared';
import workPackageQueryArgs from '../../prisma-query-args/work-packages.query-args';
import WorkPackagesService from '../../services/work-packages.services';
import { descBulletConverter } from '../../utils/utils';
import prisma from '../prisma';

/**
 * Creates a work package with the given data using service functions. This has to be done by:
 * 1) creating the work package
 * 2) editing the work package
 */
export const seedWorkPackage = async (
  creator: User,
  projectWbsNumber: WbsNumber,
  name: string,
  changeRequestId: number,
  stage: Work_Package_Stage | null,
  startDate: string,
  duration: number,
  dependencies: WbsNumber[],
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
    projectWbsNumber,
    name,
    changeRequestId,
    startDate,
    duration,
    dependencies,
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
    workPackage.dependencies,
    workPackage.expectedActivities.map(descBulletConverter),
    workPackage.deliverables.map(descBulletConverter),
    status,
    projectLead,
    projectManager
  );

  return { workPackageWbsNumber, workPackage };
};
