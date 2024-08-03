import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';

export type WorkPackageTemplateQueryArgs = ReturnType<typeof getWorkPackageTemplateQueryArgs>;

export const getWorkPackageTemplateQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      blockedBy: true,
      descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
      blocking: true
    }
  });

export type WorkPackageTemplatePreviewQueryArgs = ReturnType<typeof getWorkPackageTemplatePreviewQueryArgs>;

export const getWorkPackageTemplatePreviewQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateDefaultArgs>()({
    include: {}
  });
