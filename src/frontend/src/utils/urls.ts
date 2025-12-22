/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, wbsPipe } from 'shared';
import { WorkPackageSelection } from 'shared';

/**
 * This file centralizes URLs used to query the API.
 */

const API_URL: string = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:3001';

/**************** Users Endpoints ****************/
const users = () => `${API_URL}/users`;
const orgUsers = () => `${users()}/organization`;
const orgMembers = () => `${users()}/members`;
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
const manyUserTasks = () => `${users()}/tasks/get-many`;
const currentUser = () => `${users()}/auth/current`;
const logUserOut = () => `${users()}/auth/log-out`;
const manyUsersWithScheduleSettings = () => `${users()}/scheduleSettings`;

/**************** Projects Endpoints ****************/
const projects = () => `${API_URL}/projects`;
const allProjectsGantt = () => `${projects()}/all-gantt`;
const allProjects = () => `${projects()}/all-previews`;
const usersTeamsProjects = () => `${projects()}/users-teams`;
const usersLeadingProjects = () => `${projects()}/leading`;
const teamsProjects = (teamId: string) => `${projects()}/teams-projects/${teamId}`;
const projectsByWbsNum = (wbsNum: string) => `${projects()}/${wbsNum}`;
const projectsCreate = () => `${projects()}/create`;
const projectsEdit = () => `${projects()}/edit`;
const projectsSetTeam = (wbsNum: string) => `${projects()}/${wbsNum}/set-team`;
const projectsDelete = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/delete';
const projectsToggleFavorite = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/favorite';
const projectsLinkTypes = () => `${projects()}/link-types`;
const projectsCreateLinkTypes = () => `${projects()}/link-types/create`;
const projectsEditLinkTypes = (linkTypeName: string) => `${projects()}/link-types/${linkTypeName}/edit`;
const projectsSetAbbreviation = () => `${projects()}/set-abbreviation`;
const projectsDeleteAbbreviation = (wbsNum: string) => projectsByWbsNum(wbsNum) + '/delete-abbreviation';

/**************** Part Review Endpoints ********************/
const parts = () => `${API_URL}/parts`;
const partsByProject = (wbsNum: string) => `${parts()}/by-project/${wbsNum}`;
const partByIndex = (wbsNum: string, partIndex: number) => `${parts()}/by-index/${wbsNum}/${partIndex}`;
const partsCreate = () => `${parts()}/create`;
const partsUploadPreviewImage = (partId: string) => `${parts()}/${partId}/upload-preview`;
const partsEdit = (partId: string) => `${parts()}/${partId}/update`;
const partsDelete = (partId: string) => `${parts()}/${partId}/delete`;
const partsCreateSubmission = () => `${parts()}/submission/create`;
const partsEditSubmission = (submissionId: string) => `${parts()}/submission/${submissionId}/update`;
const partsCreateReviewRequest = (submissionId: string) => `${parts()}/reviewRequest/${submissionId}/create`;
const partsDeleteReviewRequest = (reviewRequestId: string) => `${parts()}/reviewRequest/${reviewRequestId}/delete`;
const partsCreateReview = () => `${parts()}/review/create`;
const partsEditReview = (reviewId: string) => `${parts()}/review/${reviewId}/update`;
const partsDeleteReview = (reviewId: string) => `${parts()}/review/${reviewId}/delete`;
const partsReviewFaqs = () => `${parts()}/faqs`;
const partsReviewFaqCreate = () => `${parts()}/faqs/create`;
const partsReviewFaqEdit = (faqId: string) => `${parts()}/faqs/${faqId}/update`;
const partsReviewFaqDelete = (faqId: string) => `${parts()}/faqs/${faqId}/delete`;
const getAllPartCommonMistakes = () => `${parts()}/common-mistakes`;
const partsCreateCommonMistake = () => `${parts()}/common-mistake/create`;
const partsEditCommonMistake = (commonMistakeId: string) => `${parts()}/common-mistake/${commonMistakeId}/update`;
const partsDeleteCommonMistake = (commonMistakeId: string) => `${parts()}/common-mistake/${commonMistakeId}/delete`;
const uploadFile = () => `${parts()}/upload/file`;
const downloadFile = (fileId: string) => `${parts()}/file/${fileId}/download`;
const getAllPartTags = () => `${parts()}/tags`;
const partTagCreate = () => `${parts()}/tag/create`;
const partTagDelete = (partTagId: string) => `${parts()}/tag/${partTagId}/delete`;
const createReviewPopup = (reviewId: string) => `${parts()}/review/${reviewId}/popup/create`;
const updateReviewPopup = (popupId: string) => `${parts()}/popup/${popupId}/update`;
const deleteReviewPopup = (popupId: string) => `${parts()}/popup/${popupId}/delete`;
const notifyPartAssignee = () => `${parts()}/notifyAssignee`;
const notifyPartReviewer = () => `${parts()}/notifyReviewer`;
const getPartReviewSampleImage = () => `${parts()}/partReviewSampleImage`;
const setPartReviewSampleImage = () => `${parts()}/partReviewSampleImage/update`;

/**************** Tasks Endpoints ********************/
const tasks = () => `${API_URL}/tasks`;
const tasksCreate = (wbsNum: string) => `${tasks()}/${wbsNum}`;
const taskEditStatus = (taskId: string) => `${tasks()}/${taskId}/edit-status`;
const editTaskById = (taskId: string) => `${tasks()}/${taskId}/edit`;
const editTaskAssignees = (taskId: string) => `${tasks()}/${taskId}/edit-assignees`;
const deleteTask = (taskId: string) => `${tasks()}/${taskId}/delete`;
const overdueTasksByTeamLeadership = (userId: string) => `${tasks()}/overdue-by-team-member/${userId}`;

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
const homePageWorkPackages = (selection: WorkPackageSelection) => `${workPackages()}/home-page/${selection}`;

/**************** Change Requests Endpoints ****************/
const changeRequests = () => `${API_URL}/change-requests`;
const toReviewChangeRequests = () => `${API_URL}/change-requests/to-review`;
const unreviewedChangeRequests = (wbsNum?: WbsNumber) =>
  `${API_URL}/change-requests/unreviewed` + (wbsNum ? `?wbsnum=${wbsPipe(wbsNum)}` : '');
const approvedChangeRequests = (wbsNum?: WbsNumber) =>
  `${API_URL}/change-requests/approved` + (wbsNum ? `?wbsnum=${wbsPipe(wbsNum)}` : '');
const changeRequestsById = (id: string) => `${changeRequests()}/${id}`;
const changeRequestsReview = () => `${changeRequests()}/review`;
const changeRequestDelete = (id: string) => changeRequestsById(id) + '/delete';
const changeRequestsCreate = () => `${changeRequests()}/new`;
const changeRequestsCreateActivation = () => `${changeRequestsCreate()}/activation`;
const changeRequestsCreateStageGate = () => `${changeRequestsCreate()}/stage-gate`;
const changeRequestsCreateBudget = () => `${changeRequestsCreate()}/budget`;
const changeRequestsCreateStandard = () => `${changeRequestsCreate()}/standard`;
const changeRequestCreateProposeSolution = () => `${changeRequestsCreate()}/proposed-solution`;
const changeRequestRequestReviewer = (id: string) => changeRequestsById(id) + '/request-review';

/**************** Teams Endpoints ****************/
const teams = () => `${API_URL}/teams`;
const teamsById = (id: string) => `${teams()}/${id}`;
const teamsDelete = (id: string) => `${teamsById(id)}/delete`;
const teamsSetMembers = (id: string) => `${teamsById(id)}/set-members`;
const teamsSetTeamType = (id: string) => `${teamsById(id)}/set-team-type`;
const setOnboardingUser = (id: string) => `${teams()}/teamType/${id}/set-onboarding-user`;
const completeOnboarding = () => `${teams()}/teamType/complete-onboarding`;
const teamsSetHead = (id: string) => `${teamsById(id)}/set-head`;
const teamsArchive = (id: string) => `${teamsById(id)}/archive`;
const teamsSetDescription = (id: string) => `${teamsById(id)}/edit-description`;
const teamsSetSlackId = (id: string) => `${teamsById(id)}/edit-slackid`;
const teamsCreate = () => `${teams()}/create`;
const teamsSetLeads = (id: string) => `${teamsById(id)}/set-leads`;
const usersTeams = () => `${teams()}/users-teams`;
const teamTypes = () => `${teams()}/teamType`;
const allTeamTypes = () => `${teamTypes()}/all`;
const teamTypesCreate = () => `${teamTypes()}/create`;
const teamTypeEdit = (id: string) => `${teamTypes()}/${id}/edit`;
const teamTypeSetImage = (id: string) => `${teamTypes()}/${id}/set-image`;
const myTeamAsHead = () => `${teams()}/my-team-as-head`;

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
const financeAssignMemberToRR = (id: string) => `${financeEndpoints()}/${id}/assign-finance-member`;
const getAllAccountCodes = () => `${financeEndpoints()}/account-codes`;
const getAllVendors = () => `${financeEndpoints()}/vendors`;
const financeUploadReceipt = (id: string) => `${financeEndpoints()}/${id}/upload-receipt`;
const financeGetUserReimbursementRequest = () => `${financeEndpoints()}/current-user`;
const financeGetUserAssignedReimbursementRequest = () => `${financeEndpoints()}/assigned-user`;
const financeGetUserReimbursements = () => `${financeEndpoints()}/reimbursements/current-user`;
const financeGetAllReimbursements = () => `${financeEndpoints()}/reimbursements`;
const financeReportRefund = () => `${financeEndpoints()}/reimburse`;
const financeEditRefund = (id: string) => `${financeReportRefund()}/${id}/edit`;
const financeSetSaboNumber = (id: string) => `${financeEndpoints()}/${id}/set-sabo-number`;
const financeDeleteReimbursement = (id: string) => `${financeEndpoints()}/${id}/delete`;
const financeMarkAsDelivered = (id: string) => `${financeEndpoints()}/${id}/delivered`;
const financeMarkAsReimbursed = (id: string) => `${financeEndpoints()}/${id}/reimbursed`;
const financeInputReimbursementRequestInSabo = (id: string) => `${financeEndpoints()}/${id}/input-in-sabo`;
const financeMarkReimbursementRequestAsSaboSubmitted = (id: string) => `${financeEndpoints()}/${id}/mark-sabo-submitted`;
const financeDenyReimbursementRequest = (id: string) => `${financeEndpoints()}/${id}/deny`;
const financeMarkPending = (id: string) => `${financeEndpoints()}/${id}/pending-finance`;
const financeRequestChanges = (id: string) => `${financeEndpoints()}/${id}/request-changes`;
const financeGetPendingAdvisorList = () => `${financeEndpoints()}/pending-advisor/list`;
const financeSendPendingAdvisorList = () => `${financeEndpoints()}/pending-advisor/send`;
const financeEditAccountCode = (accountCodeId: string) => `${getAllAccountCodes()}/${accountCodeId}/edit`;
const financeDeleteAccountCode = (accountCodeId: string) => `${financeEndpoints()}/account-codes/${accountCodeId}/delete`;
const financeDeleteOtherProductReason = (otherReasonId: string) =>
  `${financeEndpoints()}/other-reimbursement-product-reasons/${otherReasonId}/delete`;
const financeCreateAccountCode = () => `${getAllAccountCodes()}/create`;
const financeCreateVendor = () => `${financeEndpoints()}/vendors/create`;
const financeEditVendor = (vendorId: string) => `${financeEndpoints()}/${vendorId}/vendors/edit`;
const financeSetVendorTaxExemptStatus = (vendorId: string) => `${financeEndpoints()}/vendors/${vendorId}/setTaxExemptStatus`;
const financeDeleteVendor = (vendorId: string) => `${financeEndpoints()}/${vendorId}/vendors/delete`;
const financeLeadershipApprove = (id: string) => `${financeEndpoints()}/${id}/leadership-approve`;

const financeRoutesEndpoints = () => `${API_URL}/finance`;
const financeCreateSponsor = () => `${financeRoutesEndpoints()}/sponsor/create`;
const financeCreateSponsorTier = () => `${financeRoutesEndpoints()}/sponsorTier/create`;
const financeCreateSponsorTask = (sponsorId: string) => `${financeRoutesEndpoints()}/sponsor/${sponsorId}/sponsorTasks`;
const financeCreateReimbursementRequestComment = (id: string) => `${financeEndpoints()}/${id}/comments`;
const getAllIndexCodes = () => `${financeEndpoints()}/index-codes`;
const editIndexCode = (indexCodeId: string) => `${financeEndpoints()}/index-codes/${indexCodeId}/edit`;
const getAllOtherProductReasons = () => `${financeEndpoints()}/other-reimbursement-product-reasons`;
const financeCreateOtherProductReason = () => `${getAllOtherProductReasons()}/create`;
const getAllSponsors = () => `${financeRoutesEndpoints()}/sponsors`;
const getSponsorTasks = (sponsorId: string) => `${financeRoutesEndpoints()}/sponsor/${sponsorId}/sponsorTasks`;
const deleteSponsor = (sponsorId: string) => `${financeRoutesEndpoints()}/sponsor/${sponsorId}/delete`;
const deleteSponsorTask = (sponsorTaskId: string) => `${financeRoutesEndpoints()}/sponsorTask/${sponsorTaskId}/delete`;
const editSponsorTask = (sponsorTaskId: string) => `${financeRoutesEndpoints()}/sponsorTask/${sponsorTaskId}/edit`;
const financeEditOtherReimbursementProductReason = (id: String) =>
  `${financeEndpoints()}/other-reimbursement-product-reasons/${id}/edit`;
const getReimbursementRequestProjectData = (projectId: string, startDate?: Date, endDate?: Date): string => {
  const url = new URL(`${financeRoutesEndpoints()}/reimbursement-request-project-data/${projectId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getReimbursementRequestTeamData = (teamId: string, startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/reimbursement-request-team-data/${teamId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getReimbursementRequestCategoryData = (
  otherReasonId: string,
  startDate?: Date,
  endDate?: Date,
  carNumber?: number
): string => {
  const url = new URL(`${financeRoutesEndpoints()}/reimbursement-request-category-data/${otherReasonId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getAllReimbursementRequestData = (startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/reimbursement-request-data`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getReimbursementRequestTeamTypeData = (
  teamTypeId: string,
  startDate?: Date,
  endDate?: Date,
  carNumber?: number
): string => {
  const url = new URL(`${financeRoutesEndpoints()}/reimbursement-request-team-type-data/${teamTypeId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getSpendingBarTeamData = (teamId: string, startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/spending-bar-team-data/${teamId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getSpendingBarTeamTypeData = (teamTypeId: string, startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/spending-bar-team-type-data/${teamTypeId}`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getSpendingBarCategoryData = (startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/spending-bar-category-data`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getAllSpendingBarData = (startDate?: Date, endDate?: Date, carNumber?: number): string => {
  const url = new URL(`${financeRoutesEndpoints()}/spending-bar-data`);
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  if (carNumber !== undefined) params.set('carNumber', carNumber.toString());
  const queryString = params.toString();
  return queryString ? `${url.toString()}?${queryString}` : url.toString();
};
const getAllSponsorTiers = () => `${financeRoutesEndpoints()}/sponsorTiers`;
const editSponsor = (sponsorId: string) => `${financeRoutesEndpoints()}/sponsor/${sponsorId}/edit`;
const financeGetUsersTeamsReimbursementRequests = () => `${financeEndpoints()}/reimbursements/current-user-team`;
const deleteSponsorTier = (sponsorTierId: string) => `${financeRoutesEndpoints()}/sponsorTier/${sponsorTierId}`;
const editSponsorTier = (sponsorTierId: string) => `${financeRoutesEndpoints()}/sponsorTier/${sponsorTierId}/edit`;

/**************** Bill of Material Endpoints **************************/
const bomEndpoints = () => `${API_URL}/projects/bom`;
const materialEndpoints = () => `${bomEndpoints()}/material`;
const assemblyEndpoints = () => `${bomEndpoints()}/assembly`;
const bomGetMaterialsByWbsNum = (wbsNum: WbsNumber) => `${bomEndpoints()}/${wbsPipe(wbsNum)}/materials`;
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
/*
const designReviews = () => `${API_URL}/design-reviews`;
const designReviewsCreate = () => `${designReviews()}/create`;
const designReviewsEdit = (designReviewId: string) => `${designReviews()}/${designReviewId}/edit`;
const designReviewById = (id: string) => `${designReviews()}/${id}`;
const designReviewDelete = (id: string) => `${designReviewById(id)}/delete`;
const designReviewMarkUserConfirmed = (id: string) => `${designReviewById(id)}/confirm-schedule`;
const designReviewSetStatus = (id: string) => `${designReviewById(id)}/set-status`;
*/

/******************* WBS Element Template Endpoints ********************/

const workPackageTemplates = () => `${API_URL}/templates`;
const workPackageTemplatesById = (workPackageTemplateId: string) => `${workPackageTemplates()}/${workPackageTemplateId}`;
const projectTemplatesById = (projectTemplateId: string) => `${workPackageTemplates()}/project/${projectTemplateId}`;
const workPackageTemplatesEdit = (workPackageTemplateId: string) =>
  `${workPackageTemplatesById(workPackageTemplateId)}/edit`;
const workPackageTemplatesCreate = () => `${workPackageTemplates()}/create`;
const workPackageTemplateDelete = (workPackageTemplateId: string) =>
  `${workPackageTemplatesById(workPackageTemplateId)}/delete`;
const projectTemplates = () => `${API_URL}/templates/project`;
const projectTemplateDelete = (projectTemplateId: string) => `${projectTemplatesById(projectTemplateId)}/delete`;
const projectTemplatesEdit = (projectTemplateId: string) => `${projectTemplatesById(projectTemplateId)}/edit`;
const projectTemplatesCreate = () => `${projectTemplates()}/create`;

/******************* Organizations Endpoints ********************/
const organizations = () => `${API_URL}/organizations`;
const currentOrganization = () => `${organizations()}/current`;
const organizationsUsefulLinks = () => `${organizations()}/useful-links`;
const organizationsSetUsefulLinks = () => `${organizationsUsefulLinks()}/set`;
const organizationsSetImages = () => `${organizations()}/images/update`;
const organizationsUpdateContacts = () => `${organizations()}/contacts/set`;
const organizationsSetOnboardingText = () => `${organizations()}/onboardingText/set`;
const organizationsUpdateApplicationLink = () => `${organizations()}/application-link/update`;
const organizationsSetDescription = () => `${organizations()}/description/set`;
const organizationsFeaturedProjects = () => `${organizations()}/featured-projects`;
const organizationsLogoImage = () => `${organizations()}/logo`;
const organizationsSetLogoImage = () => `${organizations()}/logo/update`;
const organizationsSetFeaturedProjects = () => `${organizationsFeaturedProjects()}/set`;
const organizationsSetWorkspaceId = () => `${organizations()}/workspaceId/set`;
const organizationsGetPartReviewGuideLink = () => `${organizations()}/part-review-guide-link/get`;
const organizationsSetPartReviewGuideLink = () => `${organizations()}/part-review-guide-link/set`;
const organizationsSetSlackSponsorshipNotificationChannelId = () => `${organizations()}/sponsorshipChannelId/set`;
const organizationsFinanceDelegates = () => `${organizations()}/finance-delegates`;
const organizationsSetFinanceDelegates = () => `${organizationsFinanceDelegates()}/set`;

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

/************** Onboarding Endpoints ***************/
const onboarding = () => `${API_URL}/onboarding`;
const allChecklists = () => `${onboarding()}/checklists`;
const generalChecklists = () => `${allChecklists()}/general`;
const checkedChecklists = () => `${allChecklists()}/checked`;
const toggleChecklist = (checklistId: string) => `${allChecklists()}/${checklistId}/toggle`;
const usersChecklists = () => `${allChecklists()}/usersChecklists`;
const createChecklist = () => `${onboarding()}/checklist/create`;
const editChecklist = (checklistId: string) => `${onboarding()}/checklist/edit/${checklistId}`;
const checklistDelete = (id: string) => `${onboarding()}/checklist/delete/${id}`;
const imageById = (imageId: string) => `${onboarding()}/image/${imageId}`;

/************** Pop Up Endpoints ***************/
const popUps = () => `${API_URL}/pop-ups`;
const popUpsCurrentUser = () => `${popUps()}/current-user`;
const popUpsRemove = (id: string) => `${popUps()}/${id}/remove`;

/************** Announcement Endpoints ***************/
const announcements = () => `${API_URL}/announcements`;
const announcementsCurrentUser = () => `${announcements()}/current-user`;
const announcementsRemove = (id: string) => `${announcements()}/${id}/remove`;

/************** Statistics Endpoints ***************/
const statistics = () => `${API_URL}/statistics`;
const createGraph = () => `${statistics()}/graph/create`;
const graphCollections = () => `${statistics()}/graph-collections`;
const graphCollectionById = (id: string) => `${graphCollections()}/${id}`;
const createGraphCollection = () => `${graphCollections()}/create`;
const getGraphById = (id: string) => `${statistics()}/graph/${id}`;
const updateGraph = (id: string) => `${getGraphById(id)}/edit`;
const updateGraphCollection = (id: string) => `${graphCollectionById(id)}/edit`;
const removeGraphFromGraphCollection = (graphCollectionId: string, graphId: string) =>
  `${graphCollectionById(graphCollectionId)}/remove/${graphId}`;
const deleteGraphCollection = (id: string) => `${graphCollectionById(id)}/delete`;

/************** Retrospective Endpoints ***************/
const retrospectiveTimelines = (startDate?: Date, endDate?: Date) =>
  `${API_URL}/retrospective/timelines?` +
  (startDate ? `start=${encodeURIComponent(startDate.toISOString())}` : '') +
  (endDate ? `end=${encodeURIComponent(endDate.toISOString())}` : '');
const retrospectiveBudgets = () => `${API_URL}/retrospective/budgets`;

/**************** Calendar Endpoints ****************/
const calendar = () => `${API_URL}/calendar`;
const calendarShops = () => `${calendar()}/shops`;
const calendarEvents = () => `${calendar()}/events`;
const calendarEventTypes = () => `${calendar()}/event-types`;
const calendarCreateShop = () => `${calendar()}/shop/create`;
const calendarFilterEvents = () => `${calendar()}/events/filter`;
const calendarMachinery = () => `${calendar()}/machinery`;
const calendarCreateMachinery = () => `${calendar()}/machinery/create`;
const calendarEditMachinery = (machineryId: string) => `${calendar()}/machinery/${machineryId}/edit`;
const calendarDeleteMachinery = (machineryId: string) => `${calendar()}/machinery/${machineryId}/delete`;
const calendarAddMachineryToShop = (machineryId: string) => `${calendar()}/machinery/${machineryId}/add-to-shop`;
const calendarEditShop = (shopId: string) => `${calendar()}/shop/${shopId}/edit`;
const calendarDeleteShop = (shopId: string) => `${calendar()}/shop/${shopId}/delete`;
const calendarDeleteCalendar = (calendarId: string) => `${calendar()}/${calendarId}/delete`;
const calendarCreateCalendar = () => `${calendar()}/create`;
const calendarEditCalendar = (calendarId: string) => `${calendar()}/${calendarId}/edit`;
const calendarCalendars = () => `${calendar()}/calendars`;
const calendarCreateEventType = () => `${calendar()}/event-type/create`;
const calendarEditEventType = (eventTypeId: string) => `${calendar()}/event-type/${eventTypeId}/edit`;
const calendarDeleteEventType = (eventTypeId: string) => `${calendar()}/event-type/${eventTypeId}/delete`;
const calendarEventMarkUserConfirmed = (id: string) => `${calendar()}/event/${id}/confirm-schedule`;
const calendarGetSingleEvent = (id: string) => `${calendar()}/event/${id}`;
const calendarDeleteEvent = (id: string) => `${calendar()}/event/${id}/delete`;
const calendarEventSetStatus = (id: string) => `${calendar()}/event/${id}/set-status`;
const calendarCreateEvent = () => `${calendar()}/event/create`;
const calendarEditEvent = (eventId: string) => `${calendar()}/event/${eventId}/edit`;
const calendarUploadDocument = (eventId: string) => `${calendar()}/event/${eventId}/upload-document`;
const calendarPDFById = (fileId: string) => `${calendar()}/document/${fileId}`;

/**************** Other Endpoints ****************/
const version = () => `https://api.github.com/repos/Northeastern-Electric-Racing/FinishLine/releases/latest`;

export const apiUrls = {
  users,
  orgUsers,
  orgMembers,
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
  manyUserTasks,
  currentUser,
  logUserOut,
  manyUsersWithScheduleSettings,

  projects,
  allProjectsGantt,
  allProjectPreviews: allProjects,
  projectsByWbsNum,
  projectsCreate,
  projectsEdit,
  projectsSetTeam,
  projectsDelete,
  projectsToggleFavorite,
  projectsLinkTypes,
  projectsCreateLinkTypes,
  projectsEditLinkTypes,
  usersLeadingProjects,
  usersTeamsProjects,
  projectsSetAbbreviation,
  projectsDeleteAbbreviation,
  partsCreateReviewRequest,
  partsDeleteReviewRequest,
  partsCreateReview,
  partsEditReview,
  partsDeleteReview,
  partsReviewFaqs,
  partsReviewFaqCreate,
  partsReviewFaqEdit,
  partsReviewFaqDelete,
  getAllPartCommonMistakes,
  partsCreateCommonMistake,
  partsEditCommonMistake,
  partsDeleteCommonMistake,
  uploadFile,
  downloadFile,
  getAllPartTags,
  partTagCreate,
  partTagDelete,
  createReviewPopup,
  updateReviewPopup,
  deleteReviewPopup,
  notifyPartAssignee,
  notifyPartReviewer,
  getPartReviewSampleImage,
  setPartReviewSampleImage,

  parts,
  partsByProject,
  partByIndex,
  partsCreate,
  partsUploadPreviewImage,
  partsEdit,
  partsDelete,
  partsCreateSubmission,
  partsEditSubmission,
  teamsProjects,

  tasksCreate,
  tasks,
  editTaskById,
  taskEditStatus,
  editTaskAssignees,
  deleteTask,
  overdueTasksByTeamLeadership,

  workPackages,
  workPackagesByWbsNum,
  workPackagesCreate,
  workPackagesEdit,
  workPackagesDelete,
  workPackagesBlocking,
  workPackagesSlackUpcomingDeadlines,
  workPackagesMany,
  homePageWorkPackages,

  changeRequests,
  changeRequestsById,
  changeRequestsReview,
  changeRequestDelete,
  changeRequestsCreate,
  changeRequestsCreateActivation,
  changeRequestsCreateStageGate,
  changeRequestsCreateBudget,
  changeRequestsCreateStandard,
  changeRequestCreateProposeSolution,
  changeRequestRequestReviewer,
  toReviewChangeRequests,
  unreviewedChangeRequests,
  approvedChangeRequests,

  teams,
  teamsById,
  teamsDelete,
  teamsSetMembers,
  teamsArchive,
  teamsSetHead,
  teamsSetDescription,
  teamsSetSlackId,
  teamsCreate,
  teamsSetLeads,
  usersTeams,
  allTeamTypes,
  teamsSetTeamType,
  setOnboardingUser,
  completeOnboarding,
  teamTypesCreate,
  teamTypeEdit,
  teamTypeSetImage,
  myTeamAsHead,

  descriptionBulletsCheck,
  descriptionBulletTypes,
  editDescriptionBulletType,
  createDescriptionBulletType,

  financeUploadRceipt,
  financeCreateReimbursementRequest,
  financeEditReimbursementRequest,
  financeAssignMemberToRR,
  financeReimbursementRequestById,
  getAllAccountCodes,
  getAllVendors,
  financeEndpoints,
  financeUploadReceipt,
  financeGetUserReimbursementRequest,
  financeGetUserAssignedReimbursementRequest,
  financeGetUserReimbursements,
  financeGetAllReimbursements,
  financeReportRefund,
  financeEditRefund,
  financeSetSaboNumber,
  financeImageById,
  financeDeleteReimbursement,
  financeMarkAsDelivered,
  financeMarkAsReimbursed,
  financeInputReimbursementRequestInSabo,
  financeMarkReimbursementRequestAsSaboSubmitted,
  financeDenyReimbursementRequest,
  financeMarkPending,
  financeRequestChanges,
  financeGetPendingAdvisorList,
  financeSendPendingAdvisorList,
  financeEditAccountCode,
  financeDeleteAccountCode,
  financeCreateAccountCode,
  financeCreateVendor,
  financeEditVendor,
  financeSetVendorTaxExemptStatus,
  financeDeleteVendor,
  financeLeadershipApprove,
  financeCreateSponsor,
  financeCreateSponsorTier,
  financeCreateSponsorTask,
  financeCreateReimbursementRequestComment,
  getAllIndexCodes,
  editIndexCode,
  getAllOtherProductReasons,
  financeCreateOtherProductReason,
  getAllSponsors,
  getSponsorTasks,
  deleteSponsor,
  deleteSponsorTask,
  editSponsorTask,
  financeEditOtherReimbursementProductReason,
  financeDeleteOtherProductReason,
  getReimbursementRequestProjectData,
  getReimbursementRequestTeamData,
  getAllReimbursementRequestData,
  getReimbursementRequestCategoryData,
  getReimbursementRequestTeamTypeData,
  getSpendingBarTeamData,
  getSpendingBarTeamTypeData,
  getSpendingBarCategoryData,
  getAllSpendingBarData,
  getAllSponsorTiers,
  editSponsor,
  financeGetUsersTeamsReimbursementRequests,
  deleteSponsorTier,
  editSponsorTier,

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
  /*
  designReviews,
  designReviewsCreate,
  designReviewById,
  designReviewsEdit,
  designReviewMarkUserConfirmed,
  designReviewDelete,
  designReviewSetStatus,
*/
  workPackageTemplates,
  workPackageTemplatesById,
  workPackageTemplatesEdit,
  workPackageTemplatesCreate,
  workPackageTemplateDelete,
  projectTemplates,
  projectTemplatesById,
  projectTemplateDelete,
  projectTemplatesEdit,
  projectTemplatesCreate,

  currentOrganization,
  organizationsUsefulLinks,
  organizationsSetUsefulLinks,
  organizationsSetImages,
  organizationsUpdateContacts,
  organizationsSetOnboardingText,
  organizationsUpdateApplicationLink,
  organizationsFeaturedProjects,
  organizationsSetDescription,
  organizationsLogoImage,
  organizationsSetLogoImage,
  organizationsSetFeaturedProjects,
  organizationsSetWorkspaceId,
  organizationsGetPartReviewGuideLink,
  organizationsSetPartReviewGuideLink,
  organizationsSetSlackSponsorshipNotificationChannelId,
  organizationsFinanceDelegates,
  organizationsSetFinanceDelegates,

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
  imageById,

  popUps,
  popUpsCurrentUser,
  popUpsRemove,

  announcements,
  announcementsCurrentUser,
  announcementsRemove,

  statistics,
  createGraph,
  graphCollections,
  graphCollectionById,
  createGraphCollection,
  getGraphById,
  updateGraph,
  updateGraphCollection,
  removeGraphFromGraphCollection,
  deleteGraphCollection,

  onboarding,
  allChecklists,
  generalChecklists,
  checkedChecklists,
  toggleChecklist,
  usersChecklists,
  createChecklist,
  editChecklist,
  checklistDelete,

  retrospectiveTimelines,
  retrospectiveBudgets,

  calendarShops,
  calendarCreateShop,
  calendarFilterEvents,
  calendarMachinery,
  calendarCreateMachinery,
  calendarEditMachinery,
  calendarDeleteMachinery,
  calendarAddMachineryToShop,
  calendarEditShop,
  calendarEventMarkUserConfirmed,
  calendarGetSingleEvent,
  calendarEvents,
  calendarEventTypes,
  calendarDeleteEvent,
  calendarEventSetStatus,
  calendarDeleteShop,
  calendarDeleteCalendar,
  calendarCreateCalendar,
  calendarEditCalendar,
  calendarCalendars,
  calendarCreateEventType,
  calendarEditEventType,
  calendarCreateEvent,
  calendarUploadDocument,
  calendarPDFById,
  calendarDeleteEventType,
  calendarEditEvent,

  version
};
