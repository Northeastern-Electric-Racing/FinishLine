import { Prisma } from '@prisma/client';
import { WorkPackageStage } from 'shared';
import { blockedByInfoTransformer } from './blocked-by-info.transformer';
import { Work_Package_Template } from '@prisma/client';
import workPackageTemplateQueryArgs from '../prisma-query-args/work-package-template.query-args';

export const workPackageTemplateTransformer = (
  wptInput: Prisma.Work_Package_TemplateGetPayload<typeof workPackageTemplateQueryArgs>
): Work_Package_Template => {
  return {
    workPackageTemplateId: wptInput.workPackageTemplateId,
    templateName: wptInput.templateName,
    templateNotes: wptInput.templateNotes,
    workPackageName: wptInput.workPackageName ?? '',
    stage: (wptInput.stage as WorkPackageStage) || undefined,
    duration: wptInput.duration ?? undefined,
    blockedBy: wptInput.blockedBy.map((info: any) => blockedByInfoTransformer(info)),
    expectedActivities: wptInput.expectedActivities,
    deliverables: wptInput.deliverables,
    dateCreated: wptInput.dateCreated,
    userCreated: wptInput.userCreated,
    userCreatedId: wptInput.userCreatedId,
    dateDeleted: wptInput.dateDeleted ?? undefined,
    userDeleted: wptInput.userDeleted ?? undefined,
    userDeletedId: wptInput.userDeletedId ?? undefined
  } as Work_Package_Template;
};
