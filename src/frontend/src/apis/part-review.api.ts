import {
  PartPayload,
  CreatePartSubmissionPayload,
  EditPartSubmissionPayload,
  PartReviewRequestPayload,
  CreatePartReviewPayload,
  EditPartReviewPayload,
  PopupPayload
} from '../hooks/part-review.hooks';
import {
  PartPreview,
  Part,
  PartSubmission,
  PartReviewRequest,
  PartReview,
  PartReviewCommonMistake,
  PartTag,
  FrequentlyAskedQuestion,
  Part_Review_Popup
} from 'shared';
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

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(apiUrls.uploadFile(), formData, {
    transformResponse: (data) => JSON.parse(data)
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
export const editPartReview = (payload: EditPartReviewPayload) => {
  return axios.post<PartReview>(apiUrls.partsEditReview(payload.partReviewId), {
    ...payload
  });
};

/**
 * Fetches all Part Review FAQs for the current organization.
 *
 * @returns A list of Part Review FAQs.
 */
export const getAllPartReviewFaqs = () => {
  return axios.get<FrequentlyAskedQuestion[]>(apiUrls.partsReviewFaqs(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * create a new Part Review FAQ.
 *
 * @param payload - The FAQ data, including question and answer.
 * @returns The created FAQ.
 */
export const createPartReviewFaq = (payload: { question: string; answer: string }) => {
  return axios.post<FrequentlyAskedQuestion>(apiUrls.partsReviewFaqCreate(), {
    ...payload
  });
};

/**
 * edits an existing Part Review FAQ.
 *
 * @param faqId - The ID of the FAQ to edit.
 * @param payload - The updated FAQ data.
 * @returns The updated FAQ.
 */
export const editPartReviewFaq = (faqId: string, payload: { question: string; answer: string }) => {
  return axios.post<FrequentlyAskedQuestion>(apiUrls.partsReviewFaqEdit(faqId), {
    ...payload
  });
};

/**
 * delete a Part Review FAQ.
 *
 * @param faqId - The ID of the FAQ to delete.
 * @returns The deleted FAQ.
 */
export const deletePartReviewFaq = (faqId: string) => {
  return axios.post<FrequentlyAskedQuestion>(apiUrls.partsReviewFaqDelete(faqId));
};

/*
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

/**
 * Creates a new Popup
 *
 * @returns the created popup
 */
export const createReviewPopup = (partReviewId: string, payload: PopupPayload) => {
  return axios.post<Part_Review_Popup>(
    apiUrls.createReviewPopup(partReviewId),
    {
      ...payload
    },
    {
      transformResponse: (data) => JSON.parse(data)
    }
  );
};

/**
 * Updates a new Popup
 *
 * @returns the updated popup
 */
export const updateReviewPopup = (popupId: string, payload: PopupPayload) => {
  return axios.post<Part_Review_Popup>(
    apiUrls.updateReviewPopup(popupId),
    {
      ...payload
    },
    {
      transformResponse: (data) => JSON.parse(data)
    }
  );
};

/**
 * Deletes a popup
 */
export const deleteReviewPopup = (popupId: string) => {
  return axios.post<{ message: string }>(apiUrls.deleteReviewPopup(popupId));
};

/**
 * Sends a notification to the assignee of a part
 * @param partId id of the part
 * @param assigneeId id of the assignee
 */
export const sendPartAssignmentNotification = (payload: { partId: string; assigneeId: string }) => {
  return axios.post<{ message: string }>(apiUrls.notifyPartAssignee(), {
    ...payload
  });
};

/**
 * Sends a notification to the reviewer of a part
 * @param partId id of the part
 * @param reviewerId id of the reviewer
 */
export const sendPartReviewRequestNotification = (payload: { partId: string; reviewerId: string }) => {
  return axios.post<{ message: string }>(apiUrls.notifyPartReviewer(), {
    ...payload
  });
};
