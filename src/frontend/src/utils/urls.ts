/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * This file centralizes URLs used to query the API.
 */

const API_URL: string = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:3001';

/**************** Users Endpoints ****************/
const users = () => `${API_URL}/users`;
const usersById = (id: string) => `${users()}/${id}`;
const usersLogin = () => `${users()}/auth/login`;
const usersLoginDev = () => `${users()}/auth/login/dev`;
const userSettingsByUserId = (id: string) => `${usersById(id)}/settings`;
const userRoleByUserId = (id: string) => `${usersById(id)}/change-role`;
const userFavoriteProjects = (id: string) => `${usersById(id)}/favorite-projects`;

/**************** Projects Endpoints ****************/
const projects = () => `${API_URL}/projects`;
const projectsByWbsNum = (wbsNum: string) => `${projects()}/${wbsNum}`;
const projectsCreate = () => `${projects()}/create`;
const projectsEdit = () => `${projects()}/edit`;
const projectsSetTeam = (wbsNum: string) => `${projects()}/${wbsNum}/set-team`;
const projectsDelete = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/delete';
const projectsToggleFavorite = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/favorite';

/**************** Tasks Endpoints ********************/
const tasks = () => `${API_URL}/tasks`;
const tasksCreate = (wbsNum: string) => `${tasks()}/${wbsNum}`;
const taskEditStatus = (taskId: string) => `${tasks()}/${taskId}/edit-status`;
const editTaskById = (taskId: string) => `${tasks()}/${taskId}/edit`;
const editTaskAssignees = (taskId: string) => `${tasks()}/${taskId}/edit-assignees`;
const deleteTask = (taskId: string) => `${tasks()}/${taskId}/delete`;

/**************** Work Packages Endpoints ****************/
const workPackages = (queryParams?: { [field: string]: string }) => {
  const url = `${API_URL}/work-packages`;
  if (!queryParams) return url;
  return `${url}?${Object.keys(queryParams)
    .map((param) => `${param}=${queryParams[param]}`)
    .join('&')}`;
};
const workPackagesByWbsNum = (wbsNum: string) => `${workPackages()}/${wbsNum}`;
const workPackagesCreate = () => `${workPackages()}/create`;
const workPackagesEdit = () => `${workPackages()}/edit`;
const workPackagesDelete = (wbsNum: string) => `${workPackagesByWbsNum(wbsNum)}/delete`;
const workPackagesBlocking = (wbsNum: string) => `${workPackagesByWbsNum(wbsNum)}/blocking`;
const workPackagesSlackUpcomingDeadlines = () => `${workPackages()}/slack-upcoming-deadlines`;

/**************** Change Requests Endpoints ****************/
const changeRequests = () => `${API_URL}/change-requests`;
const changeRequestsById = (id: string) => `${changeRequests()}/${id}`;
const changeRequestsReview = () => `${changeRequests()}/review`;
const changeRequestDelete = (id: string) => changeRequestsById(id) + '/delete';
const changeRequestsCreate = () => `${changeRequests()}/new`;
const changeRequestsCreateActivation = () => `${changeRequestsCreate()}/activation`;
const changeRequestsCreateStageGate = () => `${changeRequestsCreate()}/stage-gate`;
const changeRequestsCreateStandard = () => `${changeRequestsCreate()}/standard`;
const changeRequestCreateProposeSolution = () => `${changeRequestsCreate()}/proposed-solution`;

/**************** Teams Endpoints ****************/
const teams = () => `${API_URL}/teams`;
const teamsById = (id: string) => `${teams()}/${id}`;
const teamsSetMembers = (id: string) => `${teamsById(id)}/set-members`;
const teamsSetDescription = (id: string) => `${teamsById(id)}/edit-description`;

/**************** Description Bullet Endpoints ****************/
const descriptionBullets = () => `${API_URL}/description-bullets`;
const descriptionBulletsCheck = () => `${descriptionBullets()}/check`;

/**************** Finance Endpoints **************************/
const financeEndpoints = () => `${API_URL}/reimbursement-requests`;
const financeUploadRceipt = (id: string) => `${financeEndpoints()}/${id}/upload-receipt`;

/**************** Other Endpoints ****************/
const version = () => `https://api.github.com/repos/Northeastern-Electric-Racing/FinishLine/releases/latest`;

export const apiUrls = {
  users,
  usersById,
  usersLogin,
  usersLoginDev,
  userSettingsByUserId,
  userRoleByUserId,
  userFavoriteProjects,

  projects,
  projectsByWbsNum,
  projectsCreate,
  projectsEdit,
  projectsSetTeam,
  projectsDelete,
  projectsToggleFavorite,

  tasksCreate,
  tasks,
  editTaskById,
  taskEditStatus,
  editTaskAssignees,
  deleteTask,

  workPackages,
  workPackagesByWbsNum,
  workPackagesCreate,
  workPackagesEdit,
  workPackagesDelete,
  workPackagesBlocking,
  workPackagesSlackUpcomingDeadlines,

  changeRequests,
  changeRequestsById,
  changeRequestsReview,
  changeRequestDelete,
  changeRequestsCreate,
  changeRequestsCreateActivation,
  changeRequestsCreateStageGate,
  changeRequestsCreateStandard,
  changeRequestCreateProposeSolution,

  teams,
  teamsById,
  teamsSetMembers,
  teamsSetDescription,

  descriptionBulletsCheck,

  financeUploadRceipt,

  version
};
