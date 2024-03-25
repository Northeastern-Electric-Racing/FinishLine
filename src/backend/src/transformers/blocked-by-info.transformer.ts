import { Prisma } from '@prisma/client';
import { blockedByInfoQueryArgs } from '../prisma-query-args/work-package-template.query-args';
import { BlockedByInfo, WorkPackageStage } from 'shared';

export const blockedByInfoTransformer = (
  bbInput: Prisma.Blocked_By_InfoGetPayload<typeof blockedByInfoQueryArgs>
): BlockedByInfo => {
  return {
    blockedByInfoId: bbInput.blockedByInfoId,
    stage: (bbInput.stage as WorkPackageStage) || undefined,
    name: bbInput.name
  };
};
