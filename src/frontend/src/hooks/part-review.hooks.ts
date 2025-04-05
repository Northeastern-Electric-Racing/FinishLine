import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Part,
  PartPreview,
  PartReview,
  PartReviewRequest,
  PartSubmission,
  Review_Status,
  PartReviewCommonMistake,
  FrequentlyAskedQuestion
} from 'shared';
import {
  createPart,
  createPartReview,
  createPartReviewFaq,
  createPartReviewRequest,
  createPartSubmission,
  deletePart,
  deletePartReviewFaq,
  deletePartReviewRequest,
  editPart,
  editPartReviewFaq,
  editPartReview,
  editPartSubmission,
  getAllPartReviewFaqs,
  getPartsFromProject,
  getSinglePart,
  getAllCommonMistakes
} from '../apis/part-review.api';

export interface PartPayload {
  index: number;
  commonName: string;
  description?: string;
  previewImageLink?: string;
  reviewStatus: Review_Status;
  tagIds: string[];
  projectId: string;
  assigneeIds: string[];
}

export interface PartSubmissionPayload {
  fileIds: string[];
  name: string;
  notes?: string;
}

export interface PartReviewRequestPayload {
  requesterId: string;
  reviewRequestedId: string;
}

export interface PartReviewPayload {
  fileIds: string[];
  notes?: string;
  commonMistakeIds: string[];
}

/**
 * Custom React Hook to fetch all parts associated with the given project as part previews
 *
 * @param projectId the id of the project
 */
export const usePartsFromProject = (/*projectId: string*/) => {
  return useQuery<PartPreview[], Error>(['parts', 'byProject'], async () => {
    const { data } = await getPartsFromProject(/*projectId*/);
    return data;
  });
};

/**
 * Custom React Hook to fetch a single part
 *
 * @param partId the id of the part
 */
export const useSinglePart = (/*partId: string*/) => {
  return useQuery<Part, Error>(['parts', 'byId' /*partId*/], async () => {
    const { data } = await getSinglePart(/*partId*/);
    return data;
  });
};

/**
 * Custom React Hook to create a new part
 */
export const useCreatePart = () => {
  const queryClient = useQueryClient();
  return useMutation<Part, Error, PartPayload>(
    ['parts', 'create'],
    async (part: PartPayload) => {
      const { data } = await createPart(part);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'byProject']);
      }
    }
  );
};

/**
 * Custom React Hook to edit a part
 *
 * @param partId the id of the part to edit
 */
export const useEditPart = (partId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Part, Error, PartPayload>(
    ['parts', 'edit'],
    async (part: PartPayload) => {
      const { data } = await editPart(partId, part);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'byProject']);
        queryClient.invalidateQueries(['parts', 'byId', partId]);
      }
    }
  );
};

/**
 * Custom React Hook to delete a part
 *
 * @param partId the id of the part to delete
 */
export const useDeletePart = (partId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Part, Error, any>(
    ['parts', 'delete'],
    async () => {
      const { data } = await deletePart(partId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'byProject']);
        queryClient.invalidateQueries(['parts', 'byId', partId]);
      }
    }
  );
};

/**
 * Custom React Hook to create a new part submission
 *
 * @param partId the id of the part to create the submission for
 */
export const useCreatePartSubmission = (partId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartSubmission, Error, PartSubmissionPayload>(
    ['parts', 'createSubmission'],
    async (submission: PartSubmissionPayload) => {
      const { data } = await createPartSubmission(partId, submission);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'byProject']);
        queryClient.invalidateQueries(['parts', 'byId', partId]);
      }
    }
  );
};

/**
 * Custom React Hook to edit a part submission
 *
 * @param submissionId the id of the part submission to edit
 */
export const useEditPartSubmission = (submissionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartSubmission, Error, PartSubmissionPayload>(
    ['parts', 'editSubmission'],
    async (submission: PartSubmissionPayload) => {
      const { data } = await editPartSubmission(submissionId, submission);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'byId']);
      }
    }
  );
};

/**
 * Custom React Hook to create a new part review request
 *
 * @param submissionId the id of the part submission to create the review request for
 */
export const useCreatePartReviewRequest = (submissionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartReviewRequest, Error, PartReviewRequestPayload>(
    ['parts', 'createReviewRequest'],
    async (reviewRequest: PartReviewRequestPayload) => {
      const { data } = await createPartReviewRequest(submissionId, reviewRequest);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a part review request
 *
 * @param reviewRequestId the id of the part review request to delete
 */
export const useDeletePartReviewRequest = (reviewRequestId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartReviewRequest, Error, any>(
    ['parts', 'deleteReviewRequest'],
    async () => {
      const { data } = await deletePartReviewRequest(reviewRequestId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts']);
      }
    }
  );
};

/**
 * Custom React Hook to create a new part review
 *
 * @param submissionId the id of the part submission to create the review for
 */
export const useCreatePartReview = (submissionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartReview, Error, PartReviewPayload>(
    ['parts', 'createReview'],
    async (review: PartReviewPayload) => {
      const { data } = await createPartReview(submissionId, review);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts']);
      }
    }
  );
};

/**
 * Custom React Hook to edit a part review
 *
 * @param reviewId the id of the part review to edit
 */
export const useEditPartReview = (reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartReview, Error, PartReviewPayload>(
    ['parts', 'editReview'],
    async (partReview: PartReviewPayload) => {
      const { data } = await editPartReview(reviewId, partReview);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts']);
      }
    }
  );
};

/**
 * React Query hook to fetch all Part Review FAQs.
 *
 * @returns Query result containing FAQs data, loading state, and error state.
 */
export const useAllPartReviewFaqs = () => {
  return useQuery<FrequentlyAskedQuestion[], Error>(['partReviewFaqs'], async () => {
    const { data } = await getAllPartReviewFaqs();
    return data;
  });
};

/**
 * React Query hook to create a new Part Review FAQ.
 *
 * Automatically invalidates the FAQs query on success.
 */
export const useCreatePartReviewFaq = () => {
  const queryClient = useQueryClient();
  return useMutation(createPartReviewFaq, {
    onSuccess: () => queryClient.invalidateQueries(['partReviewFaqs'])
  });
};

/**
 * React Query hook to edit an existing Part Review FAQ.
 *
 * Automatically invalidates the FAQs query on success.
 */
export const useEditPartReviewFaq = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ faqId, payload }: { faqId: string; payload: { question: string; answer: string } }) =>
      editPartReviewFaq(faqId, payload),
    {
      onSuccess: () => queryClient.invalidateQueries(['partReviewFaqs'])
    }
  );
};

/**
 * React Query hook to delete a Part Review FAQ.
 *
 * Automatically invalidates the FAQs query on success.
 */
export const useDeletePartReviewFaq = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePartReviewFaq, {
    onSuccess: () => queryClient.invalidateQueries(['partReviewFaqs'])
  });
};

/*

 * Custom React Hook to get all common mistakes
 *
 * @returns a list of all common mistakes
 */
export const useAllCommonMistakes = () => {
  const queryClient = useQueryClient();
  return useQuery<PartReviewCommonMistake[], Error>(
    ['common mistakes'],
    async () => {
      const { data } = await getAllCommonMistakes();
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['common mistakes']);
      }
    }
  );
};
