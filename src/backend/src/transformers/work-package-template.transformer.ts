import { Prisma } from '@prisma/client';
import { BlockedByInfo, WorkPackageStage, WorkPackageTemplate } from 'shared';
import { workPackageTemplateQueryArgs } from '../prisma-query-args/work-package-template.query-args';

export const workPackageTemplateTransformer = (
  wptInput: Prisma.Work_Package_TemplateGetPayload<typeof workPackageTemplateQueryArgs>
): WorkPackageTemplate => {
  return {
    workPackageTemplateId: wptInput.workPackageTemplateId,
    templateName: wptInput.templateName,
    templateNotes: wptInput.templateNotes,
    workPackageName: wptInput.workPackageName ?? '',
    stage: (wptInput.stage as WorkPackageStage) ?? undefined,
    duration: wptInput.duration ?? undefined,
    blockedBy: wptInput.blockedBy.map((info) => workPackageTemplateTransformer(info)),
    expectedActivities: wptInput.expectedActivities,
    deliverables: wptInput.deliverables,
    dateCreated: wptInput.dateCreated,
    userCreated: wptInput.userCreated,
    userCreatedId: wptInput.userCreatedId,
    dateDeleted: wptInput.dateDeleted ?? undefined,
    userDeleted: wptInput.userDeleted ?? undefined,
    userDeletedId: wptInput.userDeletedId ?? undefined
  } as WorkPackageTemplate;
};
