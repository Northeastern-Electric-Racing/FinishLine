/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**************** General Section ****************/
const HOME = `/`;
const LOGIN = `/login`;
const SETTINGS = `/settings`;
const INFO = `/info`;
const GANTT = `/gantt`;
const CREDITS = `/credits`;

/**************** Finance Section ****************/
const FINANCE = `/finance`;

/**************** Projects Section ****************/
const PROJECTS = `/projects`;
const PROJECTS_OVERVIEW = PROJECTS + '/overview';
const PROJECTS_ALL = PROJECTS + '/all';
const PROJECTS_BY_WBS = PROJECTS + `/:wbsNum`;
const PROJECTS_NEW = PROJECTS + `/new`;
const WORK_PACKAGE_NEW = PROJECTS + `/work-package/new`;

/**************** Teams Section ****************/
const TEAMS = `/teams`;
const TEAMS_BY_ID = TEAMS + `/:teamId`;

/**************** Change Requests Section ****************/
const CHANGE_REQUESTS = `/change-requests`;
const ALL_CHANGE_REQUESTS = CHANGE_REQUESTS + `/all`;
const CHANGE_REQUESTS_BY_ID = CHANGE_REQUESTS + `/:id`;
const CR_BY_ID = `/cr/:id`; // short version of CHANGE_REQUESTS_BY_ID
const CHANGE_REQUESTS_NEW = CHANGE_REQUESTS + `/new`;
const CHANGE_REQUESTS_NEW_WITH_WBS = CHANGE_REQUESTS_NEW + `?wbsNum=`;
const CHANGE_REQUESTS_OVERVIEW = CHANGE_REQUESTS + `/overview`;

/**************** Admin Tools Setion ****************/
const ADMIN_TOOLS = `/admin-tools`;

export const routes = {
  HOME,
  LOGIN,
  SETTINGS,
  INFO,
  CREDITS,

  TEAMS,
  TEAMS_BY_ID,

  GANTT,

  PROJECTS,
  PROJECTS_OVERVIEW,
  PROJECTS_ALL,
  PROJECTS_BY_WBS,
  PROJECTS_NEW,
  WORK_PACKAGE_NEW,

  CHANGE_REQUESTS,
  ALL_CHANGE_REQUESTS,
  CHANGE_REQUESTS_BY_ID,
  CR_BY_ID,
  CHANGE_REQUESTS_NEW,
  CHANGE_REQUESTS_NEW_WITH_WBS,
  CHANGE_REQUESTS_OVERVIEW,

  FINANCE,

  ADMIN_TOOLS
};
