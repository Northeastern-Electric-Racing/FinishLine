import axios from '../utils/axios';
import { WorkPackageStage, DescriptionBulletPreview, ProjectTemplate, WorkPackageTemplate } from 'shared';
import { apiUrls } from '../utils/urls';
import { projectTemplateTransformer, workPackageTemplateTransformer } from './transformers/work-package-templates.transformer';

export interface WorkPackageTemplateApiInputs {
  templateName: string;
  templateNotes: string;
  duration: number | undefined;
  stage?: WorkPackageStage;
  blockedBy: string[];
  descriptionBullets: DescriptionBulletPreview[];
  workPackageName?: string;
  workPackageTemplateId?: string;
}
export interface ProjectTemplateApiInputs {
  templateName: string;
  templateNotes: string;
  workPackageTemplates: WorkPackageTemplateApiInputs[];
  projectName?: string;
}

/**
 * Edit a work package template.
 *
 * @param payload Object containing required key-value pairs for backend function to edit work package
 * @returns Promise that will resolve to either a success status code or a fail status code.
 */
export const editWorkPackageTemplate = (workPackageTempateId: string, payload: WorkPackageTemplateApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackageTemplatesEdit(workPackageTempateId), {
    ...payload
  });
};

/**
 * Gets all the workpackage templates from the database
 * @returns gets all the workpackage templates
 */
export const getAllWorkPackageTemplates = () => {
  return axios.get<WorkPackageTemplate[]>(apiUrls.workPackageTemplates(), {
    transformResponse: (data) => JSON.parse(data).map(workPackageTemplateTransformer)
  });
};

/**
 * Delete a work package template.
 *
 * @param workPackageTemplateId The work package template id to be deleted.
 */
export const deleteWorkPackageTemplate = (workPackageTemplateId: string) => {
  return axios.delete<{ message: string }>(apiUrls.workPackageTemplateDelete(workPackageTemplateId));
};

/*
 * Gets a single work package template from the database
 * @returns a single work package template
 */
export const getSingleWorkPackageTemplate = (workPackageTemplateId: string) => {
  return axios.get<WorkPackageTemplate>(apiUrls.workPackageTemplatesById(workPackageTemplateId), {
    transformResponse: (data) => workPackageTemplateTransformer(JSON.parse(data))
  });
};

/**
 * Create a single work package template.
 *
 * @param payload Payload containing all the necessary data to create a work package template.
 */
export const createSingleWorkPackageTemplate = (payload: WorkPackageTemplateApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackageTemplatesCreate(), {
    ...payload
  });
};

/**
 * Get all project templates
 */
export const getAllProjectTemplates = () => {
  return axios.get<ProjectTemplate[]>(apiUrls.projectTemplates(), {
    transformResponse: (data) => {
      return JSON.parse(data).map(projectTemplateTransformer)}
  });
};

/**
 * Delete a project template.
 *
 * @param projectTemplateId The project template id to be deleted.
 */
export const deleteProjectTemplate = (projectTemplateId: string) => {
  return axios.delete<{ message: string }>(apiUrls.projectTemplateDelete(projectTemplateId));
};

/**
 * Get a single project template.
 * @param projectTemplateId The project template id to be fetched.
 * @returns A single project template.
 */
export const getSingleProjectTemplate = (projectTemplateId: string) => {
  return axios.get<ProjectTemplate>(apiUrls.projectTemplatesById(projectTemplateId), {});
};

export const editProjectTemplate = (projectTemplateId: string, payload: ProjectTemplateApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.projectTemplatesEdit(projectTemplateId), {
    ...payload
  });
}