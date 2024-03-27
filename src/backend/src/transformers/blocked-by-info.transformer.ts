import { Prisma } from '@prisma/client';
import { BlockedByInfo, WorkPackageStage } from 'shared';

export const blockedByInfoTransformer = (bbInput: Prisma.Blocked_By_InfoGetPayload<{}>): BlockedByInfo => {
  return {
    blockedByInfoId: bbInput.blockedByInfoId,
    stage: (bbInput.stage as WorkPackageStage) || undefined,
    name: bbInput.name
  };
};