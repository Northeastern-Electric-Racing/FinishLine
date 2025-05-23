import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Part,
  PartPreview,
  PartReview,
  PartReviewRequest,
  PartSubmission,
  Review_Status,
  PartReviewCommonMistake,
  FrequentlyAskedQuestion,
  PartTag,
  Part_Review_Popup
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
  getAllPartTags,
  createReviewPopup,
  updateReviewPopup,
  deleteReviewPopup,
  uploadFile,
  setPartReviewSampleImage,
  getPartReviewSampleImage,
  createCommonMistake,
  updateCommonMistake,
  deleteCommonMistake,
  createPartTag,
  deletePartTag,
  deletePartReview
} from '../apis/part-review.api';
import { downloadGoogleImage } from '../apis/onboarding.api';

export interface PartPayload {
  wbsNum: string;
  index: number;
  commonName: string;
  description?: string;
  reviewStatus: Review_Status;
  tagIds: string[];
  assigneeIds: string[];
  reviewerIds: string[];
}

export interface EditPartSubmissionPayload {
  name: string;
  notes?: string;
}

export interface CreatePartSubmissionPayload extends EditPartSubmissionPayload {
  partId: string;
  fileIds: string[];
}

export interface PartReviewRequestPayload {
  requesterId: string;
  reviewRequestedId: string;
}

export interface CreatePartReviewPayload {
  submissionId: string;
  status: Review_Status;
  fileIds: string[];
  notes?: string;
}

export interface EditPartReviewPayload {
  partReviewId: string;
  notes?: string;
  status?: Review_Status;
  fileIds?: string[];
}

export interface PopupPayload {
  xCoord: number;
  yCoord: number;
  fileIndex: number;
  title: string;
  description?: string;
}

export interface PartReviewCommonMistakePayload {
  title: string;
  description: string;
  starred: boolean;
}

export interface PartTagPayload {
  name: string;
  colorHexCode: string;
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

export const useUploadFile = () => {
  return useMutation<string, Error, File>(['file', 'upload'], async (file: File) => {
    const { data } = await uploadFile(file);
    return data;
  });
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
export const useEditPartReview = () => {
  const queryClient = useQueryClient();
  return useMutation<PartReview, Error, EditPartReviewPayload>(
    ['parts', 'editReview'],
    async (partReview: EditPartReviewPayload) => {
      const { data } = await editPartReview(partReview);
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
 * Custom React Hook to delete a part review
 *
 * @returns a success message
 */
export const useDeletePartReview = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['parts', 'deleteReview'],
    async (partReviewId: string) => {
      const { data } = await deletePartReview(partReviewId);
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
  return useQuery<PartReviewCommonMistake[], Error>(['common-mistakes'], async () => {
    const { data } = await getAllCommonMistakes();
    return data;
  });
};

/**
 * Custom React Hook to create a new common mistake
 *
 * @returns the created common mistake
 */
export const useCreateCommonMistake = () => {
  const queryClient = useQueryClient();
  return useMutation<PartReviewCommonMistake, Error, PartReviewCommonMistakePayload>(
    ['common-mistakes', 'create'],
    async (payload) => {
      const { data } = await createCommonMistake(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['common-mistakes']);
      }
    }
  );
};

/**
 * Custom React Hook to update a common mistake
 *
 * @returns the updated common mistake
 */
export const useUpdateCommonMistake = () => {
  const queryClient = useQueryClient();
  return useMutation<PartReviewCommonMistake, Error, { commonMistakeId: string; payload: PartReviewCommonMistakePayload }>(
    ['common-mistakes', 'update'],
    async ({ commonMistakeId, payload }) => {
      const { data } = await updateCommonMistake(commonMistakeId, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['common-mistakes']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a common mistake
 *
 * @returns the deleted common mistake
 */
export const useDeletePartReviewCommonMistake = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['common-mistakes', 'delete'],
    async (partReviewCommonMistakeId: string) => {
      const { data } = await deleteCommonMistake(partReviewCommonMistakeId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['common-mistakes']);
      }
    }
  );
};

/**
 * Custom React Hook to get all part tags
 *
 * @returns a list of all part tags
 */
export const useGetAllPartTags = () => {
  return useQuery<PartTag[], Error>(['partTags'], async () => {
    const { data } = await getAllPartTags();
    return data;
  });
};

export const useCreatePartTag = () => {
  const queryClient = useQueryClient();
  return useMutation<PartTag, Error, PartTagPayload>(
    ['partTags', 'create'],
    async (payload: PartTagPayload) => {
      const { data } = await createPartTag(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['partTags']);
      }
    }
  );
};

export const useDeletePartTag = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>(
    ['partTags', 'delete'],
    async (partTagId: string) => {
      const { data } = await deletePartTag(partTagId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['partTags']);
      }
    }
  );
};

/**
 * Custom React Hook to download files
 *
 * @returns a blob of the downloaded file
 */
export const useDownloadFile = (fileId: string) => {
  return useQuery<Blob | undefined, Error>(['parts', 'file', fileId], async () => {
    return await downloadGoogleImage(fileId);
  });
};

/**
 * Custom React Hook to create a review popup
 *
 * @returns the created popup
 */
export const useCreateReviewPopup = () => {
  const queryClient = useQueryClient();

  return useMutation<Part_Review_Popup, Error, { reviewId: string; payload: PopupPayload }>(
    ['parts', 'popup', 'create'],
    async (data) => {
      const response = await createReviewPopup(data.reviewId, data.payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'by index']);
      }
    }
  );
};

/**
 * Custom React Hook to update a review popup
 *
 * @returns the updated popup
 */
export const useUpdateReviewPopup = () => {
  const queryClient = useQueryClient();

  return useMutation<Part_Review_Popup, Error, { popupId: string; payload: PopupPayload }>(
    ['parts', 'popup', 'update'],
    async (data) => {
      const response = await updateReviewPopup(data.popupId, data.payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'by index']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a popup
 *
 * @returns a success message
 */
export const useDeleteReviewPopup = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['parts', 'popup', 'delete'],
    async (popupId: string) => {
      const { data } = await deleteReviewPopup(popupId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['parts', 'by index']);
      }
    }
  );
};

/**
 * Hook to set the part review sample image for the organization.
 */
export const useSetPartReviewSampleImage = () => {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, File>(
    ['part-review-sample-image', 'upload'],
    async (file: File) => {
      const { data } = await setPartReviewSampleImage(file);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['part-review-sample-image']);
      }
    }
  );
};

/**
 * Hook to get the part review sample image as a Blob
 */
export const usePartReviewSampleImageId = () => {
  return useQuery<string | undefined, Error>(['part-review-sample-image'], async () => {
    const { data: fileId } = await getPartReviewSampleImage();
    return fileId;
  });
};
