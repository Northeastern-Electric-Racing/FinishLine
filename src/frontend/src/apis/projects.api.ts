/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import {
  BaseProject,
  Link,
  LinkType,
  LinkCreateArgs,
  LinkTypeCreatePayload,
  ProjectDetail,
  ProjectGanttItem,
  ProjectListItem,
  ProjectOverviewCard,
  WbsNumber,
  WorkPackageTemplate
} from 'shared';
import { wbsPipe } from '../utils/pipes';
import { apiUrls } from '../utils/urls';
import {
  baseProjectTransformer,
  projectDetailTransformer,
  projectGanttItemTransformer,
  projectOverviewCardTransformer
} from './transformers/projects.transformers';
import { CreateSingleProjectPayload, EditSingleProjectPayload } from '../utils/types';

/**
 * Fetches all projects with query args needed for Gantt chart
 * Note: Gantt supports multi-car local selection and handles its own frontend filtering,
 * so we bypass the global car filter using overrideCarId: 'all-cars'
 */
export const getAllProjectsGantt = () => {
  return axios.get<ProjectGanttItem[]>(apiUrls.allProjectsGantt(), {
    transformResponse: (data) => JSON.parse(data).map(projectGanttItemTransformer),
    overrideCarId: 'all-cars'
  });
};

/**
 * Fetches all projects with preview querry args
 */
export const getAllProjects = () => {
  return axios.get<ProjectListItem[]>(apiUrls.allProjectPreviews(), {
    transformResponse: (data) => JSON.parse(data).map(baseProjectTransformer)
  });
};

/**
 * Fetches all projects with preview querry args for Copy BOM
 * Note: Copy BOM lets the user pick any past car to copy from and handles its own
 * frontend filtering, so we bypass the global car filter using overrideCarId: 'all-cars'
 */
export const getAllProjectsCopyBOM = () => {
  return axios.get<ProjectListItem[]>(apiUrls.allProjectPreviews(), {
    transformResponse: (data) => JSON.parse(data).map(baseProjectTransformer),
    overrideCarId: 'all-cars'
  });
};

/**
 * Fetches all the projects that are on the users teams
 */
export const getUsersTeamsProjects = () => {
  return axios.get<ProjectOverviewCard[]>(apiUrls.usersTeamsProjects(), {
    transformResponse: (data) => JSON.parse(data).map(projectOverviewCardTransformer)
  });
};

/**
 * Fetches all projects that the user is the manager or lead of.
 */
export const getUsersLeadingProjects = () => {
  return axios.get<ProjectOverviewCard[]>(apiUrls.usersLeadingProjects(), {
    transformResponse: (data) => JSON.parse(data).map(projectOverviewCardTransformer)
  });
};

/**
 * Fetches all projects that are on that team.
 */
export const getTeamsProjects = (teamId: string) => {
  return axios.get<BaseProject[]>(apiUrls.teamsProjects(teamId), {
    transformResponse: (data) => JSON.parse(data).map(baseProjectTransformer)
  });
};

/**
 * Fetches a single project.
 *
 * @param wbsNum Project WBS number of the requested project.
 */
export const getSingleProject = (wbsNum: WbsNumber) => {
  return axios.get<ProjectDetail>(apiUrls.projectsByWbsNum(wbsPipe(wbsNum)), {
    transformResponse: (data) => projectDetailTransformer(JSON.parse(data))
  });
};

/**
 * Create a single project.
 *
 * @param payload Payload containing all information needed to create a project.
 */
export const createSingleProject = (payload: CreateSingleProjectPayload) => {
  return axios.post<BaseProject>(
    apiUrls.projectsCreate(),
    { ...payload },
    { transformResponse: (data) => baseProjectTransformer(JSON.parse(data)) }
  );
};

/**
 * Edit a single project
 *
 * @param payload Payload containing all information needed to edit a project.
 */
export const editSingleProject = (payload: EditSingleProjectPayload) => {
  return axios.post<void>(apiUrls.projectsEdit(), {
    ...payload
  });
};

/**
 * Sets the project's team.
 * @param wbsNum the wbsNum of the project
 * @param teamId the id of the team the project is being assigned to
 */
export const setProjectTeam = (wbsNum: WbsNumber, teamId: string) => {
  return axios.post<void>(apiUrls.projectsSetTeam(wbsPipe(wbsNum)), {
    teamId
  });
};

/*
 * Delete a project.
 *
 * @param wbsNum The WBS Number of the Project being deleted.
 */
export const deleteProject = (wbsNumber: WbsNumber) => {
  return axios.delete<void>(apiUrls.projectsDelete(wbsPipe(wbsNumber)));
};

/**
 * Toggles a user's favorite status on a project
 * @param wbsNum Project WBS number of the requested project to toggle favorite for.
 */
export const toggleProjectFavorite = (wbsNum: WbsNumber) => {
  return axios.post<void>(apiUrls.projectsToggleFavorite(wbsPipe(wbsNum)));
};

/**
 * gets all the link types from the database
 * @returns gets all the link types
 */
export const getAllLinkTypes = () => {
  return axios.get<LinkType[]>(apiUrls.projectsLinkTypes(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Creates a linkType in the database
 * @param linkType the data for the linkType
 * @returns the new linkType
 */
export const createLinkType = async (linkTypeData: LinkTypeCreatePayload) => {
  return axios.post(apiUrls.projectsCreateLinkTypes(), linkTypeData);
};

/**
 * Gets all the workpackage templates from the database
 * @returns gets all the workpackage templates
 */
export const getAllWorkPackageTemplates = () => {
  return axios.get<WorkPackageTemplate[]>(apiUrls.workPackageTemplates(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Edits a linkType in the database
 * @param name the (unique) name of the linkType to edit
 * @param linkTypeData the edited data of the linkType
 * @returns the updated linkType
 */
export const editLinkType = async (name: string, linkTypeData: LinkTypeCreatePayload) => {
  return axios.post(apiUrls.projectsEditLinkTypes(name), linkTypeData);
};

/**
 * gets all the useful links from the database
 * @returns gets all the useful links
 */
export const getAllUsefulLinks = () => {
  return axios.get<Link[]>(apiUrls.organizationsUsefulLinks(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * sets all the useful links
 * @returns gets all the link types
 */
export const setUsefulLinks = (linksObject: { links: LinkCreateArgs[] }) => {
  return axios.post<Link[]>(apiUrls.organizationsSetUsefulLinks(), linksObject);
};

/**
 * Set the abbreviation of a project
 */
export const setAbbreviation = (payload: { wbsNum: string; abbreviation: string }) => {
  return axios.post<void>(apiUrls.projectsSetAbbreviation(), {
    ...payload
  });
};

/**
 * Delete the abbreviation of a project
 */
export const deleteAbbreviation = (wbsNum: string) => {
  return axios.post<void>(apiUrls.projectsDeleteAbbreviation(wbsNum));
};

/**
 * Replaces the project's teams with the given list of teams.
 * @param wbsNum the wbsNum of the project
 * @param teamIds the ids of the teams the project should be assigned to
 */
export const editProjectTeams = (wbsNum: WbsNumber, teamIds: string[]) => {
  return axios.post<{ message: string }>(apiUrls.projectsEditTeams(wbsPipe(wbsNum)), {
    teamIds
  });
};
