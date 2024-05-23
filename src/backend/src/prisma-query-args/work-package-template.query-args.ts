import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';

export type WorkPackageTemplateQueryArgs = ReturnType<typeof getWorkPackageTemplateQueryArgs>;

export const getWorkPackageTemplateQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      blockedBy: true,
      descriptionBullets: getDescriptionBulletQueryArgs(organizationId)
    }
  });

export type WorkPackageTemplatePreviewQueryArgs = ReturnType<typeof getWorkPackageTemplatePreviewQueryArgs>;

export const getWorkPackageTemplatePreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateArgs>()({
    include: {}
  });
