import { Blocked_By_Info, Blocked_By_InfoPayload, Prisma } from '@prisma/client';
import { WorkPackageStage } from 'shared';
import { workPackageTemplateTransformer } from './work-package-template.transformer';

export const blockedByInfoTransformer = (
  bbInput: Prisma.Blocked_By_InfoGetPayload<typeof blockedByInfoQueryArgs>
): Blocked_By_Info => {
  return {
    blockedByInfoId: bbInput.blockedByInfoId,
    stage: (bbInput.stage as WorkPackageStage) || undefined,
    name: bbInput.name,
    workPackageTemplateId: bbInput.workPackageTemplateId
  };
};
