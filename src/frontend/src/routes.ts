/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**************** General Section ****************/
const HOME = `/`;
const LOGIN = `/login`;
const SETTINGS = `/settings`;
const HELP = `/help`;
const TEAMS = `/teams`;

/**************** Projects Section ****************/
const PROJECTS = `/projects`;
const PROJECTS_BY_WBS = PROJECTS + `/:wbsNum`;
const PROJECTS_NEW = PROJECTS + `/new`;
const WORK_PACKAGE_NEW = PROJECTS + `/work-package/new`;

/**************** Change Requests Section ****************/
const CHANGE_REQUESTS = `/change-requests`;
const CHANGE_REQUESTS_BY_ID = CHANGE_REQUESTS + `/:id`;
const CR_BY_ID = `/cr/:id`; // short version of CHANGE_REQUESTS_BY_ID
const CHANGE_REQUESTS_NEW = CHANGE_REQUESTS + `/new`;
const CHANGE_REQUESTS_NEW_WITH_WBS = CHANGE_REQUESTS_NEW + `?wbsNum=`;

export const routes = {
  HOME,
  LOGIN,
  SETTINGS,
  HELP,
  TEAMS,

  PROJECTS,
  PROJECTS_BY_WBS,
  PROJECTS_NEW,
  WORK_PACKAGE_NEW,

  CHANGE_REQUESTS,
  CHANGE_REQUESTS_BY_ID,
  CR_BY_ID,
  CHANGE_REQUESTS_NEW,
  CHANGE_REQUESTS_NEW_WITH_WBS
};
