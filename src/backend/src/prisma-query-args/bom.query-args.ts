import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getTeamQueryArgs } from './teams.query-args';
import { getReimbursementRequestQueryArgs } from './reimbursement-requests.query-args';

export type AssemblyQueryArgs = ReturnType<typeof getAssemblyQueryArgs>;

export const getAssemblyQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.AssemblyDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      materials: getMaterialPreviewQueryArgs(organizationId),
      wbsElement: {
        include: {
          project: {
            include: {
              teams: getTeamQueryArgs(organizationId)
            }
          },
          workPackage: {
            include: {
              project: {
                include: {
                  teams: getTeamQueryArgs(organizationId)
                }
              }
            }
          }
        }
      }
    }
  });

export type MaterialQueryArgs = ReturnType<typeof getMaterialQueryArgs>;

export const getMaterialQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.MaterialDefaultArgs>()({
    include: {
      assembly: getAssemblyQueryArgs(organizationId),
      wbsElement: true,
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      materialType: true,
      unit: true,
      manufacturer: true,
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
      reimbursementRequest: getReimbursementRequestQueryArgs(organizationId)
    }
  });
