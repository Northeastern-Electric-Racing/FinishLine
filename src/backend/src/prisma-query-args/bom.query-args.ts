import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getReimbursementRequestQueryArgs } from './reimbursement-requests.query-args.js';

export type AssemblyQueryArgs = ReturnType<typeof getAssemblyQueryArgs>;

export const getAssemblyQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.AssemblyDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      materials: getMaterialPreviewQueryArgs(organizationId),
      wbsElement: true
    }
  });

export type MaterialQueryArgs = ReturnType<typeof getMaterialQueryArgs>;

export const getMaterialQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.MaterialDefaultArgs>()({
    include: {
      wbsElement: true,
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      materialType: true,
      unit: true,
      manufacturer: true,
      reimbursementProducts: false,
      reimbursementRequest: getReimbursementRequestQueryArgs(organizationId)
    }
  });

export type MaterialPreviewQueryArgs = ReturnType<typeof getMaterialPreviewQueryArgs>;

export const getMaterialPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.MaterialDefaultArgs>()({
    include: {
      unit: true,
      manufacturer: true,
      materialType: true,
      reimbursementProducts: false,
      reimbursementRequest: getReimbursementRequestQueryArgs(organizationId)
    }
  });
