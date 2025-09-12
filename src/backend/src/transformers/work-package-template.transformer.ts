import { Prisma } from '@prisma/client';
import { ProjectTemplate, WorkPackageStage, WorkPackageTemplate, WorkPackageTemplatePreview } from 'shared';
import {
  ProjectTemplateQueryArgs,
  WorkPackageTemplatePreviewQueryArgs,
  WorkPackageTemplateQueryArgs
} from '../prisma-query-args/wbs-element-template.query-args';
import descriptionBulletTransformer from './description-bullets.transformer';
import { userTransformer } from './user.transformer';
import { teamPreviewTransformer } from './teams.transformer';

export const workPackageTemplateTransformer = (
  wptInput: Prisma.Work_Package_TemplateGetPayload<WorkPackageTemplateQueryArgs>
): WorkPackageTemplate => {
  return {
    workPackageTemplateId: wptInput.wbsElementTemplateId,
    templateName: wptInput.wbsElementTemplate.templateName,
    templateNotes: wptInput.wbsElementTemplate.templateNotes,
    workPackageName: wptInput.wbsElementTemplate.wbsElementName ?? '',
    stage: (wptInput.stage as WorkPackageStage) ?? undefined,
    duration: wptInput.duration ?? undefined,
    blockedBy: wptInput.blockedBy.map(WorkPackageTemplatePreviewTransformer),
    descriptionBullets: wptInput.wbsElementTemplate.descriptionBullets.map(descriptionBulletTransformer),
    dateCreated: wptInput.wbsElementTemplate.dateCreated,
    userCreated: userTransformer(wptInput.wbsElementTemplate.userCreated),
    dateDeleted: wptInput.wbsElementTemplate.dateDeleted ?? undefined,
    userDeleted: wptInput.wbsElementTemplate.userDeleted
      ? userTransformer(wptInput.wbsElementTemplate.userDeleted)
      : undefined
  };
};

const WorkPackageTemplatePreviewTransformer = (
  workPackageTemplate: Prisma.Work_Package_TemplateGetPayload<WorkPackageTemplatePreviewQueryArgs>
): WorkPackageTemplatePreview => {
  return {
    workPackageTemplateId: workPackageTemplate.wbsElementTemplateId,
    templateName: workPackageTemplate.wbsElementTemplate.templateName,
    stage: (workPackageTemplate.stage as WorkPackageStage) ?? undefined,
    templateNotes: workPackageTemplate.wbsElementTemplate.templateNotes
  };
};

export const projectTemplateTransformer = (
  projectTemplate: Prisma.Project_TemplateGetPayload<ProjectTemplateQueryArgs>
): ProjectTemplate => {
  return {
    templateName: projectTemplate.wbsElementTemplate.templateName,
    templateNotes: projectTemplate.wbsElementTemplate.templateNotes,
    projectTemplateId: projectTemplate.wbsElementTemplateId,
    projectName: projectTemplate.wbsElementTemplate.wbsElementName ?? undefined,
    workPackageTemplates: projectTemplate.workPackageTemplates.map(workPackageTemplateTransformer),
    descriptionBullets: projectTemplate.wbsElementTemplate.descriptionBullets.map(descriptionBulletTransformer),
    budget: projectTemplate.budget ?? undefined,
    teams: projectTemplate.teams.map(teamPreviewTransformer),
    summary: projectTemplate.summary ?? undefined
  };
};
