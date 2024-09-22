/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, wbsPipe } from 'shared';

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
const currentUserSecureSettings = () => `${users()}/secure-settings/current-user`;
const userSecureSettingsSet = () => `${users()}/secure-settings/set`;
const userRoleByUserId = (id: string) => `${usersById(id)}/change-role`;
const userFavoriteProjects = (id: string) => `${usersById(id)}/favorite-projects`;
const userSecureSettings = (id: string) => `${usersById(id)}/secure-settings`;
const userScheduleSettings = (id: string) => `${usersById(id)}/schedule-settings`;
const userScheduleSettingsSet = () => `${users()}/schedule-settings/set`;
const userTasks = (id: string) => `${usersById(id)}/tasks`;

/**************** Projects Endpoints ****************/
const projects = () => `${API_URL}/projects`;
const allProjects = (includeDeleted: boolean) => `${projects()}/all/${includeDeleted ? 'true' : 'false'}`;
const projectsByWbsNum = (wbsNum: string) => `${projects()}/${wbsNum}`;
const projectsCreate = () => `${projects()}/create`;
const projectsEdit = () => `${projects()}/edit`;
const projectsSetTeam = (wbsNum: string) => `${projects()}/${wbsNum}/set-team`;
const projectsDelete = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/delete';
const projectsToggleFavorite = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/favorite';
const projectsLinkTypes = () => `${projects()}/link-types`;
const projectsCreateLinkTypes = () => `${projects()}/link-types/create`;
const projectsEditLinkTypes = (linkTypeName: string) => `${projects()}/link-types/${linkTypeName}/edit`;

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
const workPackagesMany = () => `${workPackages()}/get-many`;

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
const changeRequestRequestReviewer = (id: string) => changeRequestsById(id) + '/request-review';

/**************** Teams Endpoints ****************/
const teams = () => `${API_URL}/teams`;
const teamsById = (id: string) => `${teams()}/${id}`;
const teamsDelete = (id: string) => `${teamsById(id)}/delete`;
const teamsSetMembers = (id: string) => `${teamsById(id)}/set-members`;
const teamsSetTeamType = (id: string) => `${teamsById(id)}/set-team-type`;
const teamsSetHead = (id: string) => `${teamsById(id)}/set-head`;
const teamsSetDescription = (id: string) => `${teamsById(id)}/edit-description`;
const teamsCreate = () => `${teams()}/create`;
const teamsSetLeads = (id: string) => `${teamsById(id)}/set-leads`;
const teamTypes = () => `${teams()}/teamType`;
const allTeamTypes = () => `${teamTypes()}/all`;
const teamTypesCreate = () => `${teamTypes()}/create`;

/**************** Description Bullet Endpoints ****************/
const descriptionBullets = () => `${API_URL}/description-bullets`;
const descriptionBulletsCheck = () => `${descriptionBullets()}/check`;
const descriptionBulletTypes = () => `${descriptionBullets()}/types`;
const editDescriptionBulletType = () => `${descriptionBullets()}/types/edit`;
const createDescriptionBulletType = () => `${descriptionBullets()}/types/create`;

/**************** Finance Endpoints **************************/
const financeEndpoints = () => `${API_URL}/reimbursement-requests`;
const financeUploadRceipt = (id: string) => `${financeEndpoints()}/${id}/upload-receipt`;
const financeCreateReimbursementRequest = () => `${financeEndpoints()}/create`;
const financeReimbursementRequestById = (id: string) => `${financeEndpoints()}/${id}`;
const financeImageById = (fileId: string) => `${financeEndpoints()}/receipt-image/${fileId}`;
const financeEditReimbursementRequest = (id: string) => `${financeEndpoints()}/${id}/edit`;
const getAllAccountCodes = () => `${financeEndpoints()}/account-codes`;
const getAllVendors = () => `${financeEndpoints()}/vendors`;
const financeUploadReceipt = (id: string) => `${financeEndpoints()}/${id}/upload-receipt`;
const financeGetUserReimbursementRequest = () => `${financeEndpoints()}/current-user`;
const financeGetUserReimbursements = () => `${financeEndpoints()}/reimbursements/current-user`;
const financeGetAllReimbursements = () => `${financeEndpoints()}/reimbursements`;
const financeReportRefund = () => `${financeEndpoints()}/reimburse`;
const financeEditRefund = (id: string) => `${financeReportRefund()}/${id}/edit`;
const financeSetSaboNumber = (id: string) => `${financeEndpoints()}/${id}/set-sabo-number`;
const financeDeleteReimbursement = (id: string) => `${financeEndpoints()}/${id}/delete`;
const financeMarkAsDelivered = (id: string) => `${financeEndpoints()}/${id}/delivered`;
const financeMarkAsReimbursed = (id: string) => `${financeEndpoints()}/${id}/reimbursed`;
const financeApproveReimbursementRequest = (id: string) => `${financeEndpoints()}/${id}/approve`;
const financeDenyReimbursementRequest = (id: string) => `${financeEndpoints()}/${id}/deny`;
const financeMarkPending = (id: string) => `${financeEndpoints()}/${id}/pending-finance`;
const financeRequestChanges = (id: string) => `${financeEndpoints()}/${id}/request-changes`;
const financeGetPendingAdvisorList = () => `${financeEndpoints()}/pending-advisor/list`;
const financeSendPendingAdvisorList = () => `${financeEndpoints()}/pending-advisor/send`;
const financeEditAccountCode = (accountCodeId: string) => `${getAllAccountCodes()}/${accountCodeId}/edit`;
const financeCreateAccountCode = () => `${getAllAccountCodes()}/create`;
const financeCreateVendor = () => `${financeEndpoints()}/vendors/create`;
const financeEditVendor = (vendorId: string) => `${financeEndpoints()}/${vendorId}/vendors/edit`;
const financeLeadershipApprove = (id: string) => `${financeEndpoints()}/${id}/leadership-approve`;

/**************** Bill of Material Endpoints **************************/
const bomEndpoints = () => `${API_URL}/projects/bom`;
const materialEndpoints = () => `${bomEndpoints()}/material`;
const assemblyEndpoints = () => `${bomEndpoints()}/assembly`;
const bomGetMaterialsByWbsNum = (wbsNum: WbsNumber) => `${materialEndpoints}/${wbsPipe(wbsNum)}`;
const bomGetAllUnits = () => `${bomEndpoints()}/units`;
const bomGetAllMaterialTypes = () => `${bomEndpoints()}/material-type`;
const bomGetAllManufacturers = () => `${bomEndpoints()}/manufacturer`;
const bomGetAssembliesByWbsNum = (wbsNum: WbsNumber) => `${bomEndpoints()}/${wbsPipe(wbsNum)}/assemblies`;
const bomCreateMaterial = (wbsNum: WbsNumber) => `${materialEndpoints()}/${wbsPipe(wbsNum)}/create`;
const bomEditMaterial = (materialId: string) => `${materialEndpoints()}/${materialId}/edit`;
const bomDeleteMaterial = (materialId: string) => `${materialEndpoints()}/${materialId}/delete`;
const bomCreateAssembly = (wbsNum: WbsNumber) => `${assemblyEndpoints()}/${wbsPipe(wbsNum)}/create`;
const bomDeleteAssembly = (assemblyId: string) => `${assemblyEndpoints()}/${assemblyId}/delete`;
const bomAssignAssembly = (materialId: string) => `${materialEndpoints()}/${materialId}/assign-assembly`;
const bomCreateManufacturer = () => `${bomEndpoints()}/manufacturer/create`;
const bomDeleteManufacturer = (manufacturerName: string) => `${bomEndpoints()}/manufacturer/${manufacturerName}/delete`;
const bomCreateMaterialType = () => `${bomEndpoints()}/material-type/create`;
const bomCreateUnit = () => `${bomGetAllUnits()}/create`;
const bomUnitById = (id: string) => `${bomGetAllUnits()}/${id}`;
const bomDeleteUnit = (id: string) => `${bomUnitById(id)}/delete`;

/************** Design Review Endpoints *******************************/
const designReviews = () => `${API_URL}/design-reviews`;
const designReviewsCreate = () => `${designReviews()}/create`;
const designReviewsEdit = (designReviewId: string) => `${designReviews()}/${designReviewId}/edit`;
const designReviewById = (id: string) => `${designReviews()}/${id}`;
const designReviewDelete = (id: string) => `${designReviewById(id)}/delete`;
const designReviewMarkUserConfirmed = (id: string) => `${designReviewById(id)}/confirm-schedule`;
const designReviewSetStatus = (id: string) => `${designReviewById(id)}/set-status`;

/******************* Work Package Template Endpoints ********************/

const workPackageTemplates = () => `${API_URL}/templates`;
const workPackageTemplatesById = (workPackageTemplateId: string) => `${workPackageTemplates()}/${workPackageTemplateId}`;
const workPackageTemplatesEdit = (workPackageTemplateId: string) =>
  `${workPackageTemplatesById(workPackageTemplateId)}/edit`;
const workPackageTemplatesCreate = () => `${workPackageTemplates()}/create`;
const workPackageTemplateDelete = (workPackageTemplateId: string) =>
  `${workPackageTemplatesById(workPackageTemplateId)}/delete`;

/******************* Organizations Endpoints ********************/
const organizations = () => `${API_URL}/organizations`;
const organizationsUsefulLinks = () => `${organizations()}/useful-links`;
const organizationsSetUsefulLinks = () => `${organizationsUsefulLinks()}/set`;

/******************* Car Endpoints ********************/
const cars = () => `${API_URL}/cars`;
const carsCreate = () => `${cars()}/create`;

/************** Recruitment Endpoints ***************/
const recruitment = () => `${API_URL}/recruitment`;
const allMilestones = () => `${recruitment()}/milestones`;
const milestoneCreate = () => `${recruitment()}/milestone/create`;
const milestoneEdit = (id: string) => `${recruitment()}/milestone/${id}/edit`;
const milestoneDelete = (id: string) => `${recruitment()}/milestone/${id}/delete`;
const allFaqs = () => `${recruitment()}/faqs`;
const faqCreate = () => `${recruitment()}/faq/create`;
const faqEdit = (id: string) => `${recruitment()}/faq/${id}/edit`;
const faqDelete = (id: string) => `${recruitment()}/faq/${id}/delete`;

/**************** Other Endpoints ****************/
const version = () => `https://api.github.com/repos/Northeastern-Electric-Racing/FinishLine/releases/latest`;

export const apiUrls = {
  users,
  usersById,
  usersLogin,
  usersLoginDev,
  userSettingsByUserId,
  userSecureSettingsSet,
  currentUserSecureSettings,
  userRoleByUserId,
  userFavoriteProjects,
  userSecureSettings,
  userScheduleSettings,
  userScheduleSettingsSet,
  userTasks,

  projects,
  allProjects,
  projectsByWbsNum,
  projectsCreate,
  projectsEdit,
  projectsSetTeam,
  projectsDelete,
  projectsToggleFavorite,
  projectsLinkTypes,
  projectsCreateLinkTypes,
  projectsEditLinkTypes,

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
  workPackagesMany,

  changeRequests,
  changeRequestsById,
  changeRequestsReview,
  changeRequestDelete,
  changeRequestsCreate,
  changeRequestsCreateActivation,
  changeRequestsCreateStageGate,
  changeRequestsCreateStandard,
  changeRequestCreateProposeSolution,
  changeRequestRequestReviewer,

  teams,
  teamsById,
  teamsDelete,
  teamsSetMembers,
  teamsSetHead,
  teamsSetDescription,
  teamsCreate,
  teamsSetLeads,
  allTeamTypes,
  teamsSetTeamType,
  teamTypesCreate,

  descriptionBulletsCheck,
  descriptionBulletTypes,
  editDescriptionBulletType,
  createDescriptionBulletType,

  financeUploadRceipt,
  financeCreateReimbursementRequest,
  financeEditReimbursementRequest,
  financeReimbursementRequestById,
  getAllAccountCodes,
  getAllVendors,
  financeEndpoints,
  financeUploadReceipt,
  financeGetUserReimbursementRequest,
  financeGetUserReimbursements,
  financeGetAllReimbursements,
  financeReportRefund,
  financeEditRefund,
  financeSetSaboNumber,
  financeImageById,
  financeDeleteReimbursement,
  financeMarkAsDelivered,
  financeMarkAsReimbursed,
  financeApproveReimbursementRequest,
  financeDenyReimbursementRequest,
  financeMarkPending,
  financeRequestChanges,
  financeGetPendingAdvisorList,
  financeSendPendingAdvisorList,
  financeEditAccountCode,
  financeCreateAccountCode,
  financeCreateVendor,
  financeEditVendor,
  financeLeadershipApprove,

  bomEndpoints,
  bomGetMaterialsByWbsNum,
  bomGetAllUnits,
  bomGetAllMaterialTypes,
  bomGetAllManufacturers,
  bomGetAssembliesByWbsNum,
  bomCreateMaterial,
  bomEditMaterial,
  bomDeleteMaterial,
  bomCreateAssembly,
  bomDeleteAssembly,
  bomAssignAssembly,
  bomCreateManufacturer,
  bomDeleteManufacturer,
  bomCreateMaterialType,
  bomCreateUnit,
  bomUnitById,
  bomDeleteUnit,

  designReviews,
  designReviewsCreate,
  designReviewById,
  designReviewsEdit,
  designReviewMarkUserConfirmed,
  designReviewDelete,
  designReviewSetStatus,

  workPackageTemplates,
  workPackageTemplatesById,
  workPackageTemplatesEdit,
  workPackageTemplatesCreate,
  workPackageTemplateDelete,

  organizationsUsefulLinks,
  organizationsSetUsefulLinks,

  cars,
  carsCreate,
  recruitment,
  allMilestones,
  milestoneCreate,
  milestoneEdit,
  milestoneDelete,
  allFaqs,
  faqCreate,
  faqEdit,
  faqDelete,

  version
};
