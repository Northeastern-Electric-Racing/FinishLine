import {
  PartPayload,
  CreatePartSubmissionPayload,
  EditPartSubmissionPayload,
  PartReviewRequestPayload,
  CreatePartReviewPayload,
  EditPartReviewPayload
} from '../hooks/part-review.hooks';
import { PartPreview, Part, PartSubmission, PartReviewRequest, PartReview, PartReviewCommonMistake, PartTag } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { partPreviewTransformer, partTransformer } from './transformers/part-review.transformers';

/**
 * Fetches all parts acosiated with the given project as part previews
 *
 * @param wbsNum the wbsNum of the project
 */
export const getPartsFromProject = async (wbsNum: string) => {
  return axios.get<PartPreview[]>(apiUrls.partsByProject(wbsNum), {
    transformResponse: (data) => JSON.parse(data).map(partPreviewTransformer)
  });
};

/**
 * Fetches a single part
 *
 * @param wbsNum the wbsNum of the project
 * @param index the index number of the part
 */
export const getSinglePart = (wbsNum: string, index: number) => {
  return axios.get<Part>(apiUrls.partByIndex(wbsNum, index), {
    transformResponse: (data) => partTransformer(JSON.parse(data))
  });
};

/**
 * Creates a new part
 *
 * @param payload the payload of the part
 */
export const createPart = (payload: PartPayload) => {
  return axios.post<Part>(apiUrls.partsCreate(), {
    ...payload
  });
};

/**
 * Uploads a preview image for a given part
 * @param file the preview image
 * @param partId the id of the part that will display this image
 */
export const uploadPreviewImage = (file: File, partId: string) => {
  const formData = new FormData();
  formData.append('image', file);
  return axios.post(apiUrls.partsUploadPreviewImage(partId), formData);
};

/**
 * Edits a part
 *
 * @param partId the id of the part to edit
 * @param payload the payload of the part
 */
export const editPart = (partId: string, payload: PartPayload) => {
  return axios.post<Part>(apiUrls.partsEdit(partId), {
    ...payload
  });
};

/**
 * Deletes a part
 *
 * @param partId the id of the part to delete
 */
export const deletePart = (partId: string) => {
  return axios.post<{ message: string }>(apiUrls.partsDelete(partId));
};

/**
 * Creates a new part submission
 *
 * @param payload the payload of the part submission
 */
export const createPartSubmission = (payload: CreatePartSubmissionPayload) => {
  return axios.post<PartSubmission>(apiUrls.partsCreateSubmission(), {
    ...payload
  });
};

/**
 * Edits a part submission
 *
 * @param partSubmissionId the id of the part submission to edit
 * @param payload the payload of the part submission
 */
export const editPartSubmission = (partSubmissionId: string, payload: EditPartSubmissionPayload) => {
  return axios.post<PartSubmission>(apiUrls.partsEditSubmission(partSubmissionId), {
    ...payload
  });
};

/**
 * Adds an array of files to a review
 *
 * @param submissionId the id of the review
 * @param images the files to upload
 */
export const setUploadSubmissionFiles = (submissionId: string, files: File[]) => {
  return axios.post<PartSubmission>(apiUrls.partsSubmissionUploadFiles(submissionId), {
    files
  });
};

/**
 * Creates a new part review request
 *
 * @param submissionId the id of the part submission to create the review request for
 * @param payload the payload of the part review request
 */
export const createPartReviewRequest = (submissionId: string, payload: PartReviewRequestPayload) => {
  return axios.post<PartReviewRequest>(apiUrls.partsCreateReviewRequest(submissionId), {
    ...payload
  });
};

/**
 * Deletes a part review request
 *
 * @param partReviewRequestId the id of the part review request to delete
 */
export const deletePartReviewRequest = (partReviewRequestId: string) => {
  return axios.post<PartReviewRequest>(apiUrls.partsDeleteReviewRequest(partReviewRequestId));
};

/**
 * Creates a new part review
 *
 * @param submissionId the id of the part submission to create the review for
 * @param payload the payload of the part review
 */
export const createPartReview = (payload: CreatePartReviewPayload) => {
  return axios.post<PartReview>(apiUrls.partsCreateReview(), {
    ...payload
  });
};

/**
 * Edits a part review
 *
 * @param partReviewId the id of the part review to edit
 * @param payload the payload of the part review
 */
export const editPartReview = (partReviewId: string, payload: EditPartReviewPayload) => {
  return axios.post<PartReview>(apiUrls.partsEditReview(partReviewId), {
    ...payload
  });
};

/**
 * Adds files to a review
 *
 * @param reviewId the review
 * @param files the files to add
 */
export const setUploadReviewFiles = (reviewId: string, files: File[]) => {
  return axios.post<PartReview>(apiUrls.partsReviewUploadFiles(reviewId), {
    files
  });
};

/**
 * Gets all of the common mistakes associated with part reviews
 *
 * @returns an array of common mistakes
 */
export const getAllCommonMistakes = () => {
  return axios.get<PartReviewCommonMistake[]>(apiUrls.getAllPartCommonMistakes());
};

/**
 * Gets all the part tags for the users organization
 *
 * @returns an array of part tags
 */
export const getAllPartTags = () => {
  return axios.get<PartTag[]>(apiUrls.getAllPartTags());
};
