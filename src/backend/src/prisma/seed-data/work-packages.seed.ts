/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization, User } from '@prisma/client';
import { DescriptionBulletPreview, WbsElementStatus, WbsNumber, WorkPackage } from 'shared';
import { WorkPackageStage } from 'shared';
import WorkPackagesService from '../../services/work-packages.services';

/**
 * Creates a work package with the given data using service functions. This has to be done by:
 * 1) creating the work package
 * 2) editing the work package
 */
export const seedWorkPackage = async (
  creator: User,
  name: string,
  changeRequestId: string,
  stage: WorkPackageStage | null,
  startDate: string,
  duration: number,
  blockedBy: WbsNumber[],
  descriptionBullets: DescriptionBulletPreview[],
  editor: User,
  _status: WbsElementStatus,
  lead: string,
  manager: string,
  projectWbsNum: WbsNumber,
  organization: Organization
): Promise<{
  workPackageWbsNumber: WbsNumber;
  workPackage: WorkPackage;
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
    projectWbsNum,
    organization
  );

  await WorkPackagesService.editWorkPackage(
    editor,
    workPackage.id,
    workPackage.name,
    changeRequestId,
    stage,
    workPackage.startDate.toString(),
    workPackage.duration,
    workPackage.blockedBy,
    descriptionBullets,
    lead,
    manager,
    organization
  );

  return { workPackageWbsNumber: workPackage.wbsNum, workPackage };
};
