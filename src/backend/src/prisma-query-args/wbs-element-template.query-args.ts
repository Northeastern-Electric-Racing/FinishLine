import { Prisma } from '@prisma/client';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getUserQueryArgs } from './user.query-args';
import { getTeamQueryArgs } from './teams.query-args';

export type WorkPackageTemplateQueryArgs = ReturnType<typeof getWorkPackageTemplateQueryArgs>;
export type ProjectTemplateQueryArgs = ReturnType<typeof getProjectTemplateQueryArgs>;

export const getWorkPackageTemplateQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateDefaultArgs>()({
    include: {
      blockedBy: getWorkPackageTemplatePreviewQueryArgs(organizationId),
      wbsElementTemplate: getWbsElementTemplateQueryArgs(organizationId)
    }
  });

export type WorkPackageTemplatePreviewQueryArgs = ReturnType<typeof getWorkPackageTemplatePreviewQueryArgs>;

export const getWorkPackageTemplatePreviewQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_TemplateDefaultArgs>()({
    include: {
      wbsElementTemplate: true
    }
  });

export const getWbsElementTemplateQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.WBS_Element_TemplateDefaultArgs>()({
    include: {
      descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId)
    }
  });

export const getProjectTemplateQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Project_TemplateDefaultArgs>()({
    include: {
      wbsElementTemplate: getWbsElementTemplateQueryArgs(organizationId),
      workPackageTemplates: {
        where: { wbsElementTemplate: { dateDeleted: null } },
        orderBy: { wbsElementTemplate: { dateCreated: 'asc' } },
        ...getWorkPackageTemplateQueryArgs(organizationId)
      },
      teams: {
        ...getTeamQueryArgs(organizationId)
      }
    }
  });
