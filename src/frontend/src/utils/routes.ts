/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**************** General Section ****************/
const BASE = `/`;
const LOGIN = `/login`;
const INFO = `/info`;
const GUEST_INFO = `/guestinfo`;
const GANTT = `/gantt`;
const CREDITS = `/credits`;

/**************** Home Section ****************/
const HOME = `/home`;
const HOME_PNM = HOME + `/pnm`;
const HOME_SELECT_SUBTEAM = HOME + `/select-subteam`;
const HOME_ACCEPT = HOME + `/accept`;
const HOME_MEMBER = HOME + `/member`;
const HOME_ONBOARDING = HOME + `/onboarding`;

/**************** Finance Section ****************/
const FINANCE = `/finance`;
const REIMBURSEMENT_REQUESTS = FINANCE + '/reimbursement-requests';
const REIMBURSEMENT_REQUEST_BY_ID = REIMBURSEMENT_REQUESTS + `/:section/:id`;
const REIMBURSEMENT_REQUEST_EDIT = REIMBURSEMENT_REQUEST_BY_ID + `/edit`;
const NEW_REIMBURSEMENT_REQUEST = REIMBURSEMENT_REQUESTS + `/my-requests/new`;
const FINANCE_DASHBOARD = FINANCE + `/dashboard`;
const COMPANIES = FINANCE + `/companies`;
const SPONSORS = `/sponsors`;

/**************** Projects Section ****************/
const PROJECTS = `/projects`;
const PROJECT_MANAGEMENT = `/project-management`;
const PROJECTS_OVERVIEW = PROJECTS + '/overview';
const PROJECTS_ALL = PROJECTS + '/all';
const PROJECTS_BY_WBS = PROJECTS + `/:wbsNum`;
const PROJECTS_NEW = PROJECTS + `/new`;
const WORK_PACKAGE_NEW = PROJECTS + `/work-package/new`;
const PROJECT_PART = PROJECTS_BY_WBS + '/part/:indexNum';

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
const PROJECT_TEMPLATES = WORK_PACKAGE_TEMPLATES + '/project';
const PROJECT_TEMPLATE_NEW = PROJECT_TEMPLATES + `/new`;
const PROJECT_TEMPLATE_EDIT = PROJECT_TEMPLATES + '/edit';

/**************** Design Review Calendar ****************/
const CALENDAR = `/calendar`;
const EVENTS = '/events';

/**************** Organizations ****************/
const ORGANIZATIONS = `/organizations`;

/**************** Statistics ****************/
const STATISTICS = `/statistics`;
const CREATE_GRAPH = `/statistics/graph-collections/:graphCollectionId/graph/create`;
const EDIT_GRAPH = `/statistics/graph-collections/:graphCollectionId/graph/:graphId/edit`;
const GRAPH_COLLECTION_BY_ID = '/statistics/graph-collections/:graphCollectionId';

/**************** Retrospective ****************/
const RETROSPECTIVE = `/retrospective`;

/**************** Rules ****************/
const RULES = `/rules`;
const RULESET_BY_ID = RULES + `/:rulesetTypeId`;
const RULESET_VIEW = RULES + `/ruleset/:rulesetId/view`;
const RULESET_EDIT = RULES + `/ruleset/:rulesetId/edit`;

export const routes = {
  BASE,
  LOGIN,
  INFO,
  GUEST_INFO,
  CREDITS,

  HOME,
  HOME_PNM,
  HOME_SELECT_SUBTEAM,
  HOME_ONBOARDING,
  HOME_ACCEPT,
  HOME_MEMBER,

  TEAMS,
  TEAMS_BY_ID,

  GANTT,

  PROJECTS,
  PROJECT_MANAGEMENT,
  PROJECTS_OVERVIEW,
  PROJECTS_ALL,
  PROJECTS_BY_WBS,
  PROJECTS_NEW,
  WORK_PACKAGE_NEW,
  PROJECT_PART,

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
  FINANCE_DASHBOARD,
  COMPANIES,

  SETTINGS,
  SETTINGS_DETAILS,
  SETTINGS_PREFERENCES,

  ADMIN_TOOLS,
  WORK_PACKAGE_TEMPLATE_NEW,
  WORK_PACKAGE_TEMPLATE_EDIT,
  WORK_PACKAGE_TEMPLATES,
  PROJECT_TEMPLATES,
  PROJECT_TEMPLATE_NEW,
  PROJECT_TEMPLATE_EDIT,

  CALENDAR,
  EVENTS,

  ORGANIZATIONS,

  STATISTICS,
  CREATE_GRAPH,
  EDIT_GRAPH,
  GRAPH_COLLECTION_BY_ID,

  SPONSORS,

  RETROSPECTIVE,

  RULES,
  RULESET_BY_ID,
  RULESET_VIEW,
  RULESET_EDIT
};
