/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**************** General Section ****************/
const BASE = `/`;
const LOGIN = `/login`;
const INFO = `/info`;
const GANTT = `/gantt`;
const CREDITS = `/credits`;

/**************** Home Section ****************/
const HOME = `/home`;
const HOME_GUEST = HOME + `/guest`;
const HOME_PNM = HOME + `/pnm`;
const HOME_MEMBER = HOME + `/member`;

/**************** Finance Section ****************/
const FINANCE = `/finance`;
const REIMBURSEMENT_REQUESTS = FINANCE + '/reimbursement-requests';
const REIMBURSEMENT_REQUEST_BY_ID = REIMBURSEMENT_REQUESTS + `/:id`;
const REIMBURSEMENT_REQUEST_EDIT = REIMBURSEMENT_REQUEST_BY_ID + `/edit`;
const NEW_REIMBURSEMENT_REQUEST = REIMBURSEMENT_REQUESTS + `/new`;

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

/****************** Settings Section  *********************/
const SETTINGS = `/settings`;
const SETTINGS_DETAILS = '/details';
const SETTINGS_PREFERENCES = SETTINGS + '/preferences';

/**************** Admin Tools Setion ****************/
const ADMIN_TOOLS = `/admin-tools`;
const WORK_PACKAGE_TEMPLATES = ADMIN_TOOLS + '/templates';
const WORK_PACKAGE_TEMPLATE_NEW = WORK_PACKAGE_TEMPLATES + `/new`;
const WORK_PACKAGE_TEMPLATE_EDIT = WORK_PACKAGE_TEMPLATES + '/edit';
/**************** Design Review Calendar ****************/
const CALENDAR = `/design-review-calendar`;
const DESIGN_REVIEW_BY_ID = CALENDAR + `/:id`;

/**************** Organizations ****************/
const ORGANIZATIONS = `/organizations`;

export const routes = {
  BASE,
  LOGIN,
  INFO,
  CREDITS,

  HOME,
  HOME_GUEST,
  HOME_PNM,
  HOME_MEMBER,

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
  NEW_REIMBURSEMENT_REQUEST,
  REIMBURSEMENT_REQUESTS,
  REIMBURSEMENT_REQUEST_BY_ID,
  REIMBURSEMENT_REQUEST_EDIT,

  SETTINGS,
  SETTINGS_DETAILS,
  SETTINGS_PREFERENCES,

  ADMIN_TOOLS,
  WORK_PACKAGE_TEMPLATE_NEW,
  WORK_PACKAGE_TEMPLATE_EDIT,
  WORK_PACKAGE_TEMPLATES,

  CALENDAR,
  DESIGN_REVIEW_BY_ID,

  ORGANIZATIONS
};
