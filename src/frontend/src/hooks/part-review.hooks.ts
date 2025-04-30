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
  getAllCommonMistakes,
  uploadPreviewImage,
  setUploadReviewFiles
} from '../apis/part-review.api';

export interface PartPayload {
  wbsNum: string;
  index: number;
  commonName: string;
  description?: string;
  reviewStatus: Review_Status;
  tagIds: string[];
  assigneeIds: string[];
}

export interface EditPartSubmissionPayload {
  name: string;
  notes?: string;
}

export interface CreatePartSubmissionPayload extends EditPartSubmissionPayload {
  partId: string;
}

export interface PartReviewRequestPayload {
  requesterId: string;
  reviewRequestedId: string;
}

export interface CreatePartReviewPayload {
  submissisonId: string;
  notes?: string;
  status?: string;
}

export interface EditPartReviewPayload {
  notes?: string;
  status?: Review_Status;
}

/**
 * Custom React Hook to fetch all parts associated with the given project as part previews
 *
 * @param wbsNum the wbs number of the project
 */
export const usePartsFromProject = (wbsNum: string) => {
  return useQuery<PartPreview[], Error>(['parts', 'by project', wbsNum], async () => {
    const { data } = await getPartsFromProject(wbsNum);
    return data;
  });
};

/**
 * Custom React Hook to fetch a single part
 *
 * @param wbsNum the wbs number of the project
 * @param index the index number of the part
 */
export const useSinglePart = (wbsNum: string, index: number) => {
  return useQuery<Part, Error>(['parts', 'by index', wbsNum, index], async () => {
    const { data } = await getSinglePart(wbsNum, index);
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
        queryClient.invalidateQueries(['parts', 'by project']);
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
        queryClient.invalidateQueries(['parts']);
      }
    }
  );
};

export const useUploadPreviewImage = (partId: string) => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, File>(
    async (image: File) => {
      const { data } = await uploadPreviewImage(image, partId);
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
 * Custom React Hook to delete a part
 *
 * @param partId the id of the part to delete
 */
export const useDeletePart = (partId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['parts', 'delete'],
    async () => {
      const { data } = await deletePart(partId);
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
 * Custom React Hook to create a new part submission
 *
 * @param partId the id of the part to create the submission for
 */
export const useCreatePartSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation<PartSubmission, Error, CreatePartSubmissionPayload>(
    ['parts', 'createSubmission'],
    async (submission: CreatePartSubmissionPayload) => {
      const { data } = await createPartSubmission(submission);
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
 * Custom React Hook to edit a part submission
 *
 * @param submissionId the id of the part submission to edit
 */
export const useEditPartSubmission = (submissionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PartSubmission, Error, EditPartSubmissionPayload>(
    ['parts', 'editSubmission'],
    async (submission: EditPartSubmissionPayload) => {
      const { data } = await editPartSubmission(submissionId, submission);
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
 */
export const useCreatePartReview = () => {
  const queryClient = useQueryClient();
  return useMutation<PartReview, Error, CreatePartReviewPayload>(
    ['parts', 'createReview'],
    async (review: CreatePartReviewPayload) => {
      const { data } = await createPartReview(review);
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
  return useMutation<PartReview, Error, EditPartReviewPayload>(
    ['parts', 'editReview'],
    async (partReview: EditPartReviewPayload) => {
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

export const useUploadReviewFiles = (reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, File[]>(
    async (images: File[]) => {
      const { data } = await setUploadReviewFiles(reviewId, images);
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

  return useMutation<FrequentlyAskedQuestion, Error, { question: string; answer: string }>(
    async (data) => {
      const response = await createPartReviewFaq(data);
      return response.data;
    },
    {
      onSuccess: async (createdFaq) => {
        await queryClient.cancelQueries(['partReviewFaqs']);
        queryClient.setQueryData<FrequentlyAskedQuestion[]>(['partReviewFaqs'], (old = []) => [...old, createdFaq]);
      }
    }
  );
};

/**
 * React Query hook to edit an existing Part Review FAQ.
 *
 * Automatically invalidates the FAQs query on success.
 */
export const useEditPartReviewFaq = () => {
  const queryClient = useQueryClient();

  return useMutation<FrequentlyAskedQuestion, Error, { faqId: string; payload: { question: string; answer: string } }>(
    async ({ faqId, payload }) => {
      const response = await editPartReviewFaq(faqId, payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['partReviewFaqs']);
      }
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
