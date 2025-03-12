import { PartPayload, PartPreview, PartSubmissionPayload, Part, PartReviewRequestPayload, PartReviewPayload } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { partPreviewTransformer, partTransformer } from './transformers/part-review.transformers';

/**
 * Fetches all parts acosiated with the given project as part previews
 *
 * @param projectId the id of the project
 */
export const getPartsFromProject = (projectId: string): Promise<{ data: PartPreview[] }> => {
  return new Promise((resolve) => {
    data: [
      {
        partId: '1',
        index: 1,
        commonName: 'wheels',
        description: 'we need wheels for the car to go, because no wheels means no rolly means no car go',
        previewImageLink: 'jqoi34ghpwadjkog5qh3',
        status: 'IN_PROGRESS',
        tags: [],
        projectId: '1',
        assignees: [],
        reviewers: [],
        createdAt: new Date(),
        userCreated: {
          userId: '1',
          firstName: 'allen',
          lastName: 'bean',
          email: 'test@test.com',
          role: 'ADMIN',
          emailId: 'test@test.com',
          permissions: []
        }
      },
      {
        partId: '2',
        index: 2,
        commonName: 'Test Part 2',
        description: 'Test Description 2',
        previewImageLink: 'qogi43tbiohrj3q2jntfpi',
        status: 'READY_FOR_REVIEW',
        tags: [],
        projectId: '1',
        assignees: [],
        reviewers: [],
        createdAt: new Date(),
        userCreated: {
          userId: '1',
          firstName: 'will',
          lastName: 'atwater',
          email: 'test@test.com',
          role: 'ADMIN',
          emailId: 'test@test.com',
          permissions: []
        }
      }
    ];
  });

  return axios.get<PartPreview[]>(apiUrls.partsByProject(projectId), {
    transformResponse: (data) => data.map(partPreviewTransformer)
  });
};

/**
 * Fetches a single part
 *
 * @param partId the id of the part
 */
export const getSinglePart = (partId: string): Promise<{ data: Part }> => {
  return new Promise((resolve) => ({
    data: {
      partId: '1',
      index: 1,
      commonName: 'Suspension',
      description: 'Test description for a suspension part, which could be a fairly lon sentence',
      previewImageLink: 'qogi43tbiohrj3q2jntfpi',
      status: 'IN_REVIEW',
      tags: [],
      projectId: '1',
      assignees: [],
      reviewers: [],
      createdAt: new Date(),
      userCreated: {
        userId: '1',
        firstName: 'john',
        lastName: 'doe',
        email: 'test@test.com',
        role: 'ADMIN',
        emailId: '1234567',
        permissions: []
      },
      submissions: [
        {
          partSubmissionId: '1',
          fileIds: ['file1', 'file2'],
          name: 'Initial Submission',
          notes: 'Please review these changes',
          partId: '1',
          userCreated: {
            userId: '1',
            firstName: 'jane',
            lastName: 'plane',
            email: 'test@test.com',
            role: 'ADMIN',
            emailId: 'test@test.com',
            permissions: []
          },
          reviewRequests: [
            {
              partReviewRequestId: '1',
              submissionId: '1',
              requester: {
                userId: '1',
                firstName: 'fred',
                lastName: 'bellinger',
                email: 'test@test.com',
                role: 'ADMIN',
                emailId: 'test@test.com',
                permissions: []
              },
              reviewerRequested: {
                userId: '2',
                firstName: 'albert',
                lastName: 'stetson',
                email: 'reviewer@test.com',
                role: 'ADMIN',
                emailId: 'reviewer@test.com',
                permissions: []
              },
              createdAt: new Date()
            }
          ],
          reviews: [
            {
              partReviewId: '1',
              fileIds: ['reviewFile1'],
              notes: 'Looks good, just a few minor changes needed',
              submissionId: '1',
              popUps: [
                {
                  partReviewPopupId: '1',
                  xCoord: 0.5,
                  yCoord: 0.25,
                  title: 'Dimension Issue',
                  description: 'Please check this measurement',
                  reviewId: '1'
                }
              ],
              completedAt: new Date(),
              createdAt: new Date(),
              userCreated: {
                userId: '2',
                firstName: 'albert',
                lastName: 'stetson',
                email: 'reviewer@test.com',
                role: 'ADMIN',
                emailId: 'reviewer@test.com',
                permissions: []
              }
            }
          ],
          createdAt: new Date()
        }
      ]
    }
  }));
  return axios.get<Part>(apiUrls.partById(partId), {
    transformResponse: (data) => partTransformer(JSON.parse(data))
  });
};

/**
 * Creates a new part
 *
 * @param payload the payload of the part
 */
export const createPart = (payload: PartPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsCreate(), {
    ...payload
  });
};

/**
 * Edits a part
 *
 * @param partId the id of the part to edit
 * @param payload the payload of the part
 */
export const editPart = (partId: string, payload: PartPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsEdit(partId), {
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
 * @param partId the id of the part to create the submission for
 * @param payload the payload of the part submission
 */
export const createPartSubmission = (partId: string, payload: PartSubmissionPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsCreateSubmission(partId), {
    ...payload
  });
};

/**
 * Edits a part submission
 *
 * @param partSubmissionId the id of the part submission to edit
 * @param payload the payload of the part submission
 */
export const editPartSubmission = (partSubmissionId: string, payload: PartSubmissionPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsEditSubmission(partSubmissionId), {
    ...payload
  });
};

/**
 * Creates a new part review request
 *
 * @param submissionId the id of the part submission to create the review request for
 * @param payload the payload of the part review request
 */
export const createPartReviewRequest = (submissionId: string, payload: PartReviewRequestPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsCreateReviewRequest(submissionId), {
    ...payload
  });
};

/**
 * Deletes a part review request
 *
 * @param partReviewRequestId the id of the part review request to delete
 */
export const deletePartReviewRequest = (partReviewRequestId: string) => {
  return axios.post<{ message: string }>(apiUrls.partsDeleteReviewRequest(partReviewRequestId));
};

/**
 * Creates a new part review
 *
 * @param submissionId the id of the part submission to create the review for
 * @param payload the payload of the part review
 */
export const createPartReview = (submissionId: string, payload: PartReviewPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsCreateReview(submissionId), {
    ...payload
  });
};

/**
 * Edits a part review
 *
 * @param partReviewId the id of the part review to edit
 * @param payload the payload of the part review
 */
export const editPartReview = (partReviewId: string, payload: PartReviewPayload) => {
  return axios.post<{ message: string }>(apiUrls.partsEditReview(partReviewId), {
    ...payload
  });
};
