/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * This file centralizes URLs used to query the API.
 */

const API_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

/**************** Users Endpoint ****************/
const users = () => `${API_URL}/users`;
const usersById = (id: string) => `${users()}/${id}`;
const usersLogin = () => `${users()}/auth:login`;
const userSettingsByUserId = (id: string) => `${usersById(id)}/settings`;

/**************** Projects Endpoint ****************/
const projects = () => `${API_URL}/projects`;
const projectsByWbsNum = (wbsNum: string) => `${projects()}/${wbsNum}`;
const projectsCreate = () => `${projects()}/new`;
const projectsEdit = () => `${projects()}/edit`;

/**************** Work Packages Endpoint ****************/
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

/**************** Change Requests Endpoint ****************/
const changeRequests = () => `${API_URL}/change-requests`;
const changeRequestsById = (id: string) => `${changeRequests()}/${id}`;
const changeRequestsReview = () => `${changeRequests()}/review`;
const changeRequestsCreate = () => `${changeRequests()}/new`;
const changeRequestsCreateActivation = () => `${changeRequestsCreate()}/activation`;
const changeRequestsCreateStageGate = () => `${changeRequestsCreate()}/stage-gate`;
const changeRequestsCreateStandard = () => `${changeRequestsCreate()}/standard`;

export const apiUrls = {
  users,
  usersById,
  usersLogin,
  userSettingsByUserId,

  projects,
  projectsByWbsNum,
  projectsCreate,
  projectsEdit,

  workPackages,
  workPackagesByWbsNum,
  workPackagesCreate,
  workPackagesEdit,

  changeRequests,
  changeRequestsById,
  changeRequestsReview,
  changeRequestsCreate,
  changeRequestsCreateActivation,
  changeRequestsCreateStageGate,
  changeRequestsCreateStandard
};
