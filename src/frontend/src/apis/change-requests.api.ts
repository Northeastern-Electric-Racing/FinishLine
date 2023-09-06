/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { ChangeRequest, WbsNumber, ChangeRequestType } from 'shared';
import { apiUrls } from '../utils/urls';
import { changeRequestTransformer } from './transformers/change-requests.transformers';
import { CreateStandardChangeRequestPayload } from '../hooks/change-requests.hooks';

/**
 * Fetches all change requests.
 */
export const getAllChangeRequests = () => {
  return axios.get<ChangeRequest[]>(apiUrls.changeRequests(), {
    transformResponse: (data) => JSON.parse(data).map(changeRequestTransformer)
  });
};

/**
 * Fetches a single change request.
 *
 * @param id Change request ID of the requested change request.
 */
export const getSingleChangeRequest = (id: number) => {
  return axios.get<ChangeRequest>(apiUrls.changeRequestsById(`${id}`), {
    transformResponse: (data) => changeRequestTransformer(JSON.parse(data))
  });
};

/**
 * Review a change request.
 *
 * @param reviewerId The ID of the user reviewing the change request.
 * @param crId The ID of the change request being reviewed.
 * @param accepted Is the change request being accepted?
 * @param reviewNotes The notes attached to reviewing the change request.
 */
export const reviewChangeRequest = (
  reviewerId: number,
  crId: number,
  accepted: boolean,
  reviewNotes: string,
  psId: string
) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestsReview(), {
    reviewerId,
    crId,
    accepted,
    reviewNotes,
    psId
  });
};

/**
 * Delete a change request.
 *
 * @param crId The ID of the change request being deleted.
 */
export const deleteChangeRequest = (crId: number) => {
  return axios.delete<{ message: string }>(apiUrls.changeRequestDelete(`${crId}`));
};

/**
 * Create a standard change request.
 *
 * @param payload The standard change request payload.
 */
export const createStandardChangeRequest = (payload: CreateStandardChangeRequestPayload) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestsCreateStandard(), payload);
};

/**
 * Create an activation change request.
 * @param submitterId The ID of the user creating the change request.
 * @param wbsNumber the wbsNumber of the WBS element the change request is for.
 * @param projectLeadId the ID of the project lead intended to be assigned to the WBS element being activated.
 * @param projectManagerId the ID of the project manager intended to be assigned to the WBS element being activated.
 * @param startDate the intended start date of the WBS element being activated.
 * @param confirmDetails are the details of the WBS element being activated fully confirmed?
 */
export const createActivationChangeRequest = (
  submitterId: number,
  wbsNum: WbsNumber,
  projectLeadId: number,
  projectManagerId: number,
  startDate: string,
  confirmDetails: boolean
) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestsCreateActivation(), {
    submitterId,
    wbsNum,
    type: ChangeRequestType.Activation,
    projectLeadId,
    projectManagerId,
    startDate,
    confirmDetails
  });
};

/**
 * Create a stage gate change request.
 * @param submitterId The ID of the user creating the change request.
 * @param wbsNumber the wbsNumber of the WBS element the change request is for.
 * @param confirmDone are all details of the WBS element being stage gated fully completed?
 */
export const createStageGateChangeRequest = (submitterId: number, wbsNum: WbsNumber, confirmDone: boolean) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestsCreateStageGate(), {
    submitterId,
    wbsNum,
    type: ChangeRequestType.StageGate,
    confirmDone
  });
};

/**
 * Create a propose solution
 * @param submitterId The ID of the user creating the change request.
 * @param crId The ID of the associated change request.
 * @param description The description of the proposed solution.
 * @param scopeImpact The scope of the change for the proposed solution.
 * @param timelineImpact The number of week(s) impact for the proposed solution.
 * @param budgetImpact The budget in dollars, for the proposed solution.
 */

export const addProposedSolution = (
  submitterId: number,
  crId: number,
  description: string,
  scopeImpact: string,
  timelineImpact: number,
  budgetImpact: number
) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestCreateProposeSolution(), {
    submitterId,
    crId,
    description,
    scopeImpact,
    timelineImpact,
    budgetImpact
  });
};

/**
 * Request reviewers in change request
 * @param crId The ID of the associated change request.
 * @param crReviewData The data to request reviewers
 */
export const requestCRReview = (crId: string, crReviewData: { userIds: number[] }) => {
  return axios.post<{ message: string }>(apiUrls.changeRequestRequestReviewer(crId), crReviewData);
};
