import { Prisma } from '@prisma/client';
import { WorkPackageStage, WorkPackageTemplate, WorkPackageTemplatePreview } from 'shared';
import {
  WorkPackageTemplatePreviewQueryArgs,
  WorkPackageTemplateQueryArgs
} from '../prisma-query-args/work-package-template.query-args';
import descriptionBulletTransformer from './description-bullets.transformer';
import { userTransformer } from './user.transformer';

export const workPackageTemplateTransformer = (
  wptInput: Prisma.Work_Package_TemplateGetPayload<WorkPackageTemplateQueryArgs>
): WorkPackageTemplate => {
  return {
    workPackageTemplateId: wptInput.workPackageTemplateId,
    templateName: wptInput.templateName,
    templateNotes: wptInput.templateNotes,
    workPackageName: wptInput.workPackageName ?? '',
    stage: (wptInput.stage as WorkPackageStage) ?? undefined,
    duration: wptInput.duration ?? undefined,
    blockedBy: wptInput.blockedBy.map(WorkPackageTemplatePreviewTransformer),
    descriptionBullets: wptInput.descriptionBullets.map(descriptionBulletTransformer),
    dateCreated: wptInput.dateCreated,
    userCreated: userTransformer(wptInput.userCreated),
    dateDeleted: wptInput.dateDeleted ?? undefined,
    userDeleted: wptInput.userDeleted ? userTransformer(wptInput.userDeleted) : undefined
  };
};

const WorkPackageTemplatePreviewTransformer = (
  workPackageTemplate: Prisma.Work_Package_TemplateGetPayload<WorkPackageTemplatePreviewQueryArgs>
): WorkPackageTemplatePreview => {
  return {
    workPackageTemplateId: workPackageTemplate.workPackageTemplateId,
    templateName: workPackageTemplate.templateName,
    stage: (workPackageTemplate.stage as WorkPackageStage) ?? undefined,
    templateNotes: workPackageTemplate.templateNotes
  };
};
