/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma, User } from '@prisma/client';
import { DescriptionBulletPreview, WbsElementStatus, WbsNumber } from 'shared';
import { WorkPackageStage } from 'shared';
import WorkPackagesService from '../../services/work-packages.services';
import { WorkPackageQueryArgs } from '../../prisma-query-args/work-packages.query-args';

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
  descriptionBullets: DescriptionBulletPreview[],
  editor: User,
  status: WbsElementStatus,
  lead: number,
  manager: number,
  organizationId: string
): Promise<{
  workPackageWbsNumber: WbsNumber;
  workPackage: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>;
}> => {
  const workPackage = await WorkPackagesService.createWorkPackage(
    creator,
    name,
    changeRequestId,
    stage,
    startDate,
    duration,
    blockedBy,
    descriptionBullets,
    organizationId
  );

  await WorkPackagesService.editWorkPackage(
    editor,
    workPackage.workPackageId,
    workPackage.wbsElement.name,
    changeRequestId,
    stage,
    workPackage.startDate.toString(),
    workPackage.duration,
    workPackage.blockedBy,
    descriptionBullets,
    lead,
    manager,
    organizationId
  );

  return { workPackageWbsNumber: { ...workPackage.wbsElement }, workPackage };
};
