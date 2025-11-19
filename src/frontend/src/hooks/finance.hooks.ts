/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  inputReimbursementRequestInSabo,
  createReimbursementRequest,
  deleteReimbursementRequest,
  denyReimbursementRequest,
  downloadBlobsToPdf,
  downloadFinanceImage,
  editReimbursementRequest,
  getAllReimbursementRequests,
  getAllReimbursements,
  getAllVendors,
  getCurrentUserReimbursementRequests,
  getCurrentUserReimbursements,
  getPendingAdvisorList,
  getSingleReimbursementRequest,
  markReimbursementRequestAsDelivered,
  markReimbursementRequestAsReimbursed,
  markReimbursementRequestAsSaboSubmitted,
  reportRefund,
  sendPendingAdvisorList,
  setSaboNumber,
  uploadSingleReceipt,
  editAccountCode,
  createAccountCode,
  createOtherProductReason,
  createVendor,
  editVendor,
  getAllAccountCodes,
  editRefund,
  leadershipApproveReimbursementRequest,
  requestReimbursementRequestChanges,
  markPendingFinance,
  createSponsor,
  createSponsorTask,
  createSponsorTier,
  getAllIndexCodes,
  getAllOtherProductReason,
  getAllSponsors,
  getSponsorTasks,
  editSponsorTask,
  deleteSponsor,
  createReimbursementRequestComment,
  getReimbursementRequestTeamData,
  getReimbursementRequestTeamTypeData,
  getReimbursementRequestProjectData,
  getReimbursementRequestCategoryData,
  getAllReimbursementRequestData,
  getSpendingBarTeamData,
  getSpendingBarCategoryData,
  getSpendingBarTeamTypeData,
  getAllSpendingBarData,
  deleteVendor,
  getAllSponsorTiers,
  editSponsor,
  getCurrentUsersTeamsReimbursementRequests,
  deleteSponsorTask,
  editOtherProductReason,
  deleteAccountCode,
  deleteOtherProductReason,
  deleteSponsorTier,
  editSponsorTier,
  editIndexCode,
  getCurrentUserAssignedReimbursementRequests,
  assignMemberToRR
} from '../apis/finance.api';
import {
  IndexCode,
  AccountCode,
  Reimbursement,
  ReimbursementReceiptCreateArgs,
  ReimbursementRequest,
  Vendor,
  ReimbursementStatus,
  OtherReimbursementProductCreateArgs,
  WbsReimbursementProductCreateArgs,
  ReimbursementStatusType,
  OtherProductReason,
  Sponsor,
  SponsorTask,
  SponsorTier,
  ReimbursementRequestComment,
  ReimbursementRequestData,
  SpendingBarData,
  CreateSponsorTask
} from 'shared';
import { fullNamePipe } from '../utils/pipes';

/**
 * Helper function to handle file upload errors with specific error messages
 * @param error - The error object from the API call
 * @param fileName - The name of the file being uploaded
 * @throws corresponding error
 */
const handleFileUploadError = (error: any, fileName: string): never => {
  if (error.response?.status === 413) {
    throw new Error(`File "${fileName}" is too large. Maximum file size allowed is 25MB.`);
  } else if (error.response?.status === 400 && error.response?.data?.message?.includes('File too large')) {
    throw new Error(`File "${fileName}" is too large. ${error.response.data.message}`);
  } else if (error.response?.status === 415) {
    throw new Error(`File "${fileName}" has an unsupported format. Please upload PNG, JPEG, or PDF files only.`);
  } else if (error.response?.data?.message) {
    throw new Error(`Failed to upload "${fileName}": ${error.response.data.message}`);
  } else if (error.message) {
    throw new Error(`Failed to upload "${fileName}": ${error.message}`);
  } else {
    throw new Error(`Failed to upload "${fileName}": Network error. Please check your connection and try again.`);
  }
};

export interface CreateReimbursementRequestPayload {
  vendorId: string;
  dateOfExpense?: Date;
  accountCodeId: string;
  otherReimbursementProducts: OtherReimbursementProductCreateArgs[];
  wbsReimbursementProducts: WbsReimbursementProductCreateArgs[];
  totalCost: number;
  indexCodeId: string;
}

export interface EditReimbursementRequestPayload extends CreateReimbursementRequestPayload {
  receiptPictures: ReimbursementReceiptCreateArgs[];
}

export interface DownloadReceiptsFormInput {
  fileIds: string[];
  startDate: Date;
  endDate: Date;
  refundSource: string;
}

export interface AccountCodePayload {
  code: number;
  name: string;
  allowed: boolean;
  amount?: number;
  indexCodeIds: string[];
}

export interface EditVendorPayload {
  name: string;
  username?: string;
  password?: string;
  discountCode?: string;
  taxExempt?: boolean;
  twoFactorContactIds?: string[];
  notes?: string;
}

export interface RefundPayload {
  amount: number;
  dateReceived: string;
}

export interface MarkDeliveredRequestPayload {
  dateDelivered: Date;
}

export interface SponsorPayload {
  name: string;
  activeStatus: boolean;
  sponsorValue: number;
  joinDate: Date;
  activeYears: number[];
  sponsorTierId: string;
  taxExempt: boolean;
  sponsorContact: string;
  sponsorTasks: CreateSponsorTask[];
  discountCode?: string;
}

export interface SponsorTierPayload {
  name: string;
  minSupportValue: number;
  colorHexCode: string;
}

export interface SponsorTaskPayload {
  dueDate: Date;
  notes: string;
  notifyDate?: Date;
  assigneeUserId?: string;
}

export interface EditSponsorTaskPayload {
  sponsorTaskId: string;
  sponsorTaskData: SponsorTaskPayload;
}

export interface DeleteSponsorTaskPaylaod {
  sponsorTaskId: string;
}

export interface OtherProductReasonPayload {
  indexCodeId: string;
  accountCodeIds: string[];
  name: string;
  budget: number;
}

export interface IndexCodePayload {
  name: string;
  code: string;
}

/**
 * Custom React hook to create a sponsor
 *
 * @returns the created sponsor
 */
export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  return useMutation<Sponsor, Error, SponsorPayload>(
    ['sponsor', 'create'],
    async (formData: SponsorPayload) => {
      const { data } = await createSponsor(formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor']);
      }
    }
  );
};

/**
 * Custom React hook to create a sponsor task
 *
 * @returns the created sponsor task
 */
export const useCreateSponsorTask = (sponsorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SponsorTask, Error, SponsorTaskPayload>(
    ['sponsor-task', 'create'],
    async (formData: SponsorTaskPayload) => {
      const { data } = await createSponsorTask(sponsorId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-task']);
      }
    }
  );
};

/**
 * Custom React hook to create a sponsor tier
 *
 * @returns the created sponsor tier
 */
export const useCreateSponsorTier = () => {
  const queryClient = useQueryClient();
  return useMutation<SponsorTier, Error, SponsorTierPayload>(
    ['sponsor-tier', 'create'],
    async (formData: SponsorTierPayload) => {
      const { data } = await createSponsorTier(formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-tiers']);
      }
    }
  );
};

export interface ReimbursementRequestCommentPayload {
  reimbursementRequestId: string;
  dateCreated: Date;
  comment: string;
}

/**
 * Custom React hook to create a reimbursement request comment
 *
 * @returns the created comment
 */
export const useCreateReimbursementRequestComment = (reimbursementRequestId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementRequestComment, Error, ReimbursementRequestCommentPayload>(
    ['reimbursement-requests', 'create', 'comment'],
    async (formData: ReimbursementRequestCommentPayload) => {
      const { data } = await createReimbursementRequestComment(reimbursementRequestId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests']);
      }
    }
  );
};

export interface ReimbursementRequestProjectDataPayload {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ReimbursementRequestTeamDataPayload {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface ReimbursementRequestDataPayload {
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface ReimbursementRequestCategoryDataPayload {
  otherReasonId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface ReimbursementRequestTeamTypeDataPayload {
  teamTypeId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface SpendingBarTeamDataPayload {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface SpendingBarTeamTypeDataPayload {
  teamTypeId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

export interface SpendingBarDataPayload {
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

/**
 * Custom React Hook to upload a new picture.
 */
export const useUploadSingleReceipt = () => {
  return useMutation<{ googleFileId: string; name: string }, Error, { file: File; id: string }>(
    ['reimbursement-requsts', 'edit'],
    async (formData: { file: File; id: string }) => {
      try {
        const { data } = await uploadSingleReceipt(formData.file, formData.id);
        return data;
      } catch (error: any) {
        handleFileUploadError(error, formData.file.name);
      }
    }
  );
};

/**
 * Custom hook that uploads many receipts to a given reimbursement request
 *
 * @returns The created receipt information
 */
export const useUploadManyReceipts = () => {
  return useMutation<{ googleFileId: string; name: string }[], Error, { files: File[]; id: string }>(
    ['reimbursement-requests', 'edit'],
    async (formData: { files: File[]; id: string }) => {
      const results = [];
      for (const file of formData.files) {
        try {
          results.push(await uploadSingleReceipt(file, formData.id));
        } catch (error: any) {
          handleFileUploadError(error, file.name);
        }
      }
      return results.map((result) => result.data);
    }
  );
};

/**
 * Custom react hook to create a reimbursement request
 *
 * @returns the created reimbursement request
 */
export const useCreateReimbursementRequest = () => {
  return useMutation<ReimbursementRequest, Error, CreateReimbursementRequestPayload>(
    ['reimbursement-requests', 'create'],
    async (formData: CreateReimbursementRequestPayload) => {
      const { data } = await createReimbursementRequest(formData);
      return data;
    }
  );
};

/**
 * Custom React Hook to edit a reimbursement request.
 *
 * @param reimbursementRequestId The id of the reimbursement request being edited
 * @returns the edited reimbursement request
 */
export const useEditReimbursementRequest = (reimbursementRequestId: string) => {
  return useMutation<ReimbursementRequest, Error, EditReimbursementRequestPayload>(
    ['reimbursement-requests', 'edit'],
    async (formData: EditReimbursementRequestPayload) => {
      const { data } = await editReimbursementRequest(reimbursementRequestId, formData);
      return data;
    }
  );
};

export const useAssignMemberToRR = (reimbursementRequestId: string) => {
  return useMutation<ReimbursementRequest, Error, { assigneeId: string }>(
    ['reimbursement-requests', 'edit'],
    async (payload: { assigneeId: string }) => {
      const { data } = await assignMemberToRR(reimbursementRequestId, payload);
      return data;
    }
  );
};

/**
 * Custom react hook to get all account codes
 *
 * @returns all the account codes
 */
export const useGetAllAccountCodes = () => {
  return useQuery<AccountCode[], Error>(['expense-types'], async () => {
    const { data } = await getAllAccountCodes();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests created by the current user
 */
export const useCurrentUserReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'user'], async () => {
    const { data } = await getCurrentUserReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests assigned to the current user
 */
export const useCurrentUserAssignedReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'assignee'], async () => {
    const { data } = await getCurrentUserAssignedReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests for the current user's teams
 */
export const useCurrentUsersTeamsReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'user'], async () => {
    const { data } = await getCurrentUsersTeamsReimbursementRequests();
    return data;
  });
};

/**
 * Custom react hook to get all the vendors
 *
 * @returns all the vendors
 */
export const useGetAllVendors = () => {
  return useQuery<Vendor[], Error>(['vendors'], async () => {
    const { data } = await getAllVendors();
    return data;
  });
};

/**
 * Custom React Hook to edit a vendor.
 *
 * @param reimbursementRequestId The id of the reimbursement request being edited
 * @returns the edited reimbursement request
 */
export const useEditVendor = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Vendor, Error, EditVendorPayload>(['vendors', 'edit'], async (formData: EditVendorPayload) => {
    const { data } = await editVendor(vendorId, formData);
    queryClient.invalidateQueries(['vendors']);
    return data;
  });
};

/**
 * Custom React Hook to get all the reimbursement requests
 */
export const useAllReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests'], async () => {
    const { data } = await getAllReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursements for the current user
 */
export const useCurrentUserReimbursements = () => {
  return useQuery<Reimbursement[], Error>(['reimbursement', 'user'], async () => {
    const { data } = await getCurrentUserReimbursements();
    return data;
  });
};

/**
 * Custom React Hook to get all the reimbursements
 */
export const useAllReimbursements = () => {
  return useQuery<Reimbursement[], Error>(['reimbursement'], async () => {
    const { data } = await getAllReimbursements();
    return data;
  });
};

/**
 * Custom React Hook to mark a reimbursement request as delivered
 *
 * @param id of the reimbursement request
 * @returns the updated reimbursement request
 */
export const useMarkReimbursementRequestAsDelivered = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementRequest, Error, MarkDeliveredRequestPayload>(
    ['reimbursement-requests', 'edit'],
    async (markDeliveredData: MarkDeliveredRequestPayload) => {
      const { data } = await markReimbursementRequestAsDelivered(id, markDeliveredData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to mark a reimbursement request as Reimbursed
 *
 * @param id id of the reimbursement request to approve
 * @returns the created reimbursed reimbursement status
 */
export const useMarkReimbursementRequestAsReimbursed = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await markReimbursementRequestAsReimbursed(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to get a single reimbursement request
 *
 * @param id Id of the reimbursement request to get
 * @returns the reimbursement request
 */
export const useSingleReimbursementRequest = (id: string) => {
  return useQuery<ReimbursementRequest, Error>(['reimbursement-requests', id], async () => {
    const { data } = await getSingleReimbursementRequest(id);
    return data;
  });
};

/**
 * Custom react hook to delete a single reimbursement request
 * @param id id of the reimbursement request to delete
 * @returns the deleted reimbursement request
 */
export const useDeleteReimbursementRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementRequest, Error>(
    ['reimbursement-requests', 'delete'],
    async () => {
      const { data } = await deleteReimbursementRequest(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests']);
      }
    }
  );
};

/**
 * Custom react hook to input a reimbursement request in SABO for the finance team
 *
 * @param id id of the reimbursement request to input in SABO
 * @returns the created pending sabo submission reimbursement status
 */
export const useInputReimbursementRequestInSabo = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await inputReimbursementRequestInSabo(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to mark a reimbursement request as submitted to SABO
 * This should be called after the user has approved the request in Concur
 *
 * @param id id of the reimbursement request to mark as submitted to SABO
 * @returns the created sabo submitted reimbursement status
 */
export const useMarkReimbursementRequestAsSaboSubmitted = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await markReimbursementRequestAsSaboSubmitted(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to approve a reimbursement request for the leadership team
 *
 * @param id id of the reimbursement request to approve
 * @returns the created pending finance reimbursement status
 */
export const useLeadershipApproveReimbursementRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await leadershipApproveReimbursementRequest(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to deny a reimbursement request for the finance team
 *
 * @param id id of the reimbursement request to deny
 * @returns the denied reimbursement request status
 */
export const useDenyReimbursementRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await denyReimbursementRequest(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom react hook to download images from google drive into a pdf
 *
 * @param fileIds The google file ids to fetch the images for
 */
export const useDownloadPDFOfImages = () => {
  return useMutation(['reimbursement-requests'], async (formData: DownloadReceiptsFormInput) => {
    const promises = formData.fileIds.map((fileId) => {
      return downloadFinanceImage(fileId);
    });

    const blobs = await Promise.all(promises);
    const pdfName = `${formData.startDate.toLocaleDateString()}-${formData.endDate.toLocaleDateString()}.pdf`;

    const pdfFileName =
      formData.refundSource !== 'BOTH' ? `receipts-${formData.refundSource}-${pdfName}` : `receipts-${pdfName}`;

    await downloadBlobsToPdf(blobs, pdfFileName);
  });
};

export const useDownloadCSVFileOfReimbursementRequests = () => {
  return useMutation(['reimbursement-requests'], async () => {
    const { data } = await getAllReimbursementRequests();
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'SABO ID,FinishLine ID,Recipient,Total Cost,Status,Account,Account Code,Date Created,Date Delivered,Date Submitted,Vendor\n' +
      data
        .map(
          (rr) =>
            `${rr.saboId},${rr.identifier},${fullNamePipe(rr.recipient)},${rr.totalCost},${
              rr.reimbursementStatuses[rr.reimbursementStatuses.length - 1].type
            },${rr.indexCode},${rr.accountCode.code},${rr.dateCreated},${rr.dateDelivered ?? ''},${
              rr.reimbursementStatuses.find((rs) => rs.type === ReimbursementStatusType.SABO_SUBMITTED)?.dateCreated ?? ''
            },${rr.vendor.name}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reimbursement-requests.csv');
    document.body.appendChild(link);
    link.click();
  });
};

/**
 * Custom react hook to get the list of Reimbursement Requests that are pending Advisor Approval
 *
 * @returns the list of Reimbursement Reqeusts that are pending Advisor Approval
 */
export const useGetPendingAdvisorList = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'pending-advisors'], async () => {
    const { data } = await getPendingAdvisorList();
    return data;
  });
};

/**
 * Custom react hook to send the pending sabo #s to our advisor
 *
 * @returns the mutation to send the pending advisor list
 */
export const useSendPendingAdvisorList = () => {
  return useMutation<{ message: string }, Error, number[]>(
    ['reimbursement-requests', 'send-pending-advisor'],
    async (saboNumbers: number[]) => {
      const { data } = await sendPendingAdvisorList(saboNumbers);
      return data;
    }
  );
};

/**
 * Custom react hook to report a dollar amount representing a new account credit
 */
export const useReportRefund = () => {
  const queryClient = useQueryClient();
  return useMutation<Reimbursement, Error, { amount: number; dateReceived: string }>(
    ['reimbursement'],
    async (formData: { amount: number; dateReceived: string }) => {
      const { data } = await reportRefund(formData.amount, formData.dateReceived);
      queryClient.invalidateQueries(['reimbursement']);
      return data;
    }
  );
};

/**
 * Custom react hook to edit a refund
 * @returns the edited refund
 */
export const useEditRefund = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<Reimbursement, Error, { amount: number; dateReceived: string }>(
    ['reimbursement', 'edit'],
    async (formData: { amount: number; dateReceived: string }) => {
      const { data } = await editRefund(id, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement']);
      }
    }
  );
};

/**
 * Custom react hook to update a reimbursement request's SABO number
 *
 * @param reimbursementRequestId the request ID
 */
export const useSetSaboNumber = (reimbursementRequestId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { saboNumber: number }>(
    ['reimbursement-requests', reimbursementRequestId],
    async (formData: { saboNumber: number }) => {
      await setSaboNumber(reimbursementRequestId, formData.saboNumber);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', reimbursementRequestId]);
      }
    }
  );
};

/**
 * Custom React Hook to edit an expense type.
 *
 * @param expenseId The id of the expense type
 */
export const useEditAccountCode = (accountCodeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, AccountCodePayload>(
    ['expense-types', 'edit'],
    async (accountCodeData: AccountCodePayload) => {
      const { data } = await editAccountCode(accountCodeId, accountCodeData);
      queryClient.invalidateQueries(['expense-types']);
      return data;
    }
  );
};

/**
 * Hook to delete the given expense type
 * @param accountCodeId expense type to be deleted
 * @returns the deleted expense type
 */
export const useDeleteAccountCode = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, string>(
    ['expense-types', 'delete'],
    async (accountCodeId: string) => {
      const { data } = await deleteAccountCode(accountCodeId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expense-types']);
      }
    }
  );
};

/**
 * Custom React Hook to create an expense type.
 */
export const useCreateAccountCode = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, AccountCodePayload>(
    ['expense-types', 'create'],
    async (accountCodeData: AccountCodePayload) => {
      const { data } = await createAccountCode(accountCodeData);
      queryClient.invalidateQueries(['expense-types']);
      return data;
    }
  );
};

/**
 * Custom React Hook to create a vendor
 */
export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation<Vendor, Error, EditVendorPayload>(['vendors', 'create'], async (vendorData: EditVendorPayload) => {
    const { data } = await createVendor(vendorData);
    queryClient.invalidateQueries(['vendors']);
    return data;
  });
};

/**
 * Hook to delete the given vendor
 * @param vendorId vendor to be deleted
 * @returns the deleted vendor
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, string>(
    ['vendors', 'delete'],
    async (vendorId: string) => {
      const { data } = await deleteVendor(vendorId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vendors']);
      }
    }
  );
};

/**
 * Custom React Hook to mark a reimbursement request as pending finance
 *
 * @param id The id of the reimbursement request to mark pending finance
 * @returns Mutation function with the ability to mark a rr as pending finance
 */
export const useMarkPendingFinance = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'pending finance'],
    async () => {
      const { data } = await markPendingFinance(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom React Hook to request changes on a reimbursement request
 *
 * @param id The id of the reimbursement request to request changes on
 * @returns Mutation function with the ability to mark a rr as requested changes
 */
export const useRequestReimbursementRequestChanges = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'request changes'],
    async () => {
      const { data } = await requestReimbursementRequestChanges(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reimbursement-requests', id]);
      }
    }
  );
};

/**
 * Custom React Hook to get all IndexCodes
 *
 * @returns all the IndexCodes
 */
export const useGetAllIndexCodes = () => {
  return useQuery<IndexCode[], Error>(['index-codes'], async () => {
    const { data } = await getAllIndexCodes();
    return data;
  });
};

/** Custom React Hook to edit an IndexCode
 *
 * @returns the updated IndexCode
 */
export const useEditIndexCode = (indexCodeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IndexCode, Error, IndexCodePayload>(
    ['index-codes', 'edit'],
    async (indexCodePayload: IndexCodePayload) => {
      const { data } = await editIndexCode(indexCodeId, indexCodePayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['index-codes']);
      }
    }
  );
};

/**
 * Custom React Hook to get all Other Product Reasons
 *
 * @returns all the other product reasons
 */
export const useGetAllOtherProductReason = () => {
  return useQuery<OtherProductReason[], Error>(['other-reimbursement-product-reasons'], async () => {
    const { data } = await getAllOtherProductReason();
    return data;
  });
};

/**
 * Custom react hook to create an other reimbursement product reason
 *
 */
export const useCreateOtherProductReason = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, OtherProductReasonPayload>(
    ['other-reimbursement-product-reason', 'create'],
    async (otherProductReasonData: OtherProductReasonPayload) => {
      const { data } = await createOtherProductReason(otherProductReasonData);
      queryClient.invalidateQueries(['other-reimbursement-product-reasons']);
      return data;
    }
  );
};

/**
 * Custom React Hook to edit an Other Product Reason
 *
 * @param otherProductReasonId The id of the other product reason
 */
export const useEditOtherProductReason = (otherProductReasonId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, OtherProductReasonPayload>(
    ['other-reimbursement-product-reason', 'edit'],
    async (otherProductReasonData: OtherProductReasonPayload) => {
      const { data } = await editOtherProductReason(otherProductReasonId, otherProductReasonData);
      queryClient.invalidateQueries(['other-reimbursement-product-reasons']);
      return data;
    }
  );
};

/**
 * Hook to delete the given other reimbursement product reason
 * @param otherReasonId other reason to be deleted
 * @returns the deleted other reason
 */
export const useDeleteOtherProductReason = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, string>(
    ['other-reimbursement-product-reason', 'delete'],
    async (otherReasonId: string) => {
      const { data } = await deleteOtherProductReason(otherReasonId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['other-reimbursement-product-reasons']);
      }
    }
  );
};

/**
 * custom React Hook to get all the sponsors
 *
 * @returns the list of all of the sponsors
 */
export const useGetAllSponsors = () => {
  return useQuery<Sponsor[], Error>(['sponsor'], async () => {
    const { data } = await getAllSponsors();
    return data;
  });
};

/**
 * custom react hook to get all of the sponsor tasks for a given sponsor
 *
 * @returns the list of all of the sponsor tasks for a given sponsor
 */
export const useGetSponsorTasks = (sponsorId: string) => {
  return useQuery<SponsorTask[], Error>(['sponsor-task'], async () => {
    const { data } = await getSponsorTasks(sponsorId);
    return data;
  });
};

/**
 * Custom React Hook to edit a sponsor task
 *
 * @returns the edited sponosor task
 */
export const useEditSponsorTask = () => {
  const queryClient = useQueryClient();

  return useMutation<SponsorTask, Error, EditSponsorTaskPayload>(
    async ({ sponsorTaskId, sponsorTaskData }) => {
      const { data } = await editSponsorTask(sponsorTaskId, sponsorTaskData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-task']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a sponsor
 *
 * @param sponsorId the id of the sponsor to be deleted
 * @returns the deleted sponsor
 */
export const useDeleteSponsor = (sponsorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Sponsor, Error>(
    ['sponsor', 'delete'],
    async () => {
      const { data } = await deleteSponsor(sponsorId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor']);
      }
    }
  );
};

export const useGetReimbursementRequestTeamData = (reimbursementRequestData: ReimbursementRequestTeamDataPayload) =>
  useQuery<ReimbursementRequestData, Error>(
    [
      'reimbursement-request-team-data',
      reimbursementRequestData.endDate,
      reimbursementRequestData.startDate,
      reimbursementRequestData.carNumber,
      reimbursementRequestData.teamId
    ],
    async () => {
      const { data } = await getReimbursementRequestTeamData(reimbursementRequestData);
      return data;
    }
  );

export const useGetReimbursementRequestTeamTypeData = (reimbursementRequestData: ReimbursementRequestTeamTypeDataPayload) =>
  useQuery<ReimbursementRequestData, Error>(
    [
      'reimbursement-request-team-type-data',
      reimbursementRequestData.endDate,
      reimbursementRequestData.startDate,
      reimbursementRequestData.carNumber,
      reimbursementRequestData.teamTypeId
    ],
    async () => {
      const { data } = await getReimbursementRequestTeamTypeData(reimbursementRequestData);
      return data;
    }
  );

export const useGetReimbursementRequestProjectData = (reimbursementRequestData: ReimbursementRequestProjectDataPayload) =>
  useQuery<ReimbursementRequestData, Error>(
    [
      'reimbursement-request-project-data',
      reimbursementRequestData.endDate,
      reimbursementRequestData.startDate,
      reimbursementRequestData.projectId
    ],
    async () => {
      const { data } = await getReimbursementRequestProjectData(reimbursementRequestData);
      return data;
    }
  );

export const useGetReimbursementRequestCategoryData = (reimbursementRequestData: ReimbursementRequestCategoryDataPayload) =>
  useQuery<ReimbursementRequestData, Error>(
    [
      'reimbursement-request-category-data',
      reimbursementRequestData.endDate,
      reimbursementRequestData.startDate,
      reimbursementRequestData.carNumber,
      reimbursementRequestData.otherReasonId
    ],
    async () => {
      const { data } = await getReimbursementRequestCategoryData(reimbursementRequestData);
      return data;
    }
  );

export const useGetAllReimbursementRequestData = (reimbursementRequestData: ReimbursementRequestDataPayload) =>
  useQuery<ReimbursementRequestData[], Error>(
    [
      'reimbursement-request-data',
      reimbursementRequestData.endDate,
      reimbursementRequestData.startDate,
      reimbursementRequestData.carNumber
    ],
    async () => {
      const { data } = await getAllReimbursementRequestData(reimbursementRequestData);
      return data;
    }
  );

export const useGetSpendingBarTeamData = (spendingBarData: SpendingBarTeamDataPayload) =>
  useQuery<SpendingBarData, Error>(
    [
      'spending-bar-team-data',
      spendingBarData.endDate,
      spendingBarData.startDate,
      spendingBarData.carNumber,
      spendingBarData.teamId
    ],
    async () => {
      const { data } = await getSpendingBarTeamData(spendingBarData);
      return data;
    }
  );

export const useGetSpendingBarTeamTypeData = (spendingBarData: SpendingBarTeamTypeDataPayload) =>
  useQuery<SpendingBarData[], Error>(
    [
      'spending-bar-team-type-data',
      spendingBarData.endDate,
      spendingBarData.startDate,
      spendingBarData.carNumber,
      spendingBarData.teamTypeId
    ],
    async () => {
      const { data } = await getSpendingBarTeamTypeData(spendingBarData);
      return data;
    }
  );

export const useGetSpendingBarCategoryData = (spendingBarData: SpendingBarDataPayload) =>
  useQuery<SpendingBarData, Error>(
    ['spending-bar-category-data', spendingBarData.endDate, spendingBarData.startDate, spendingBarData.carNumber],
    async () => {
      const { data } = await getSpendingBarCategoryData(spendingBarData);
      return data;
    }
  );

export const useGetAllSpendingBarData = (spendingBarData: SpendingBarDataPayload) =>
  useQuery<SpendingBarData[], Error>(
    ['spending-bar-data', spendingBarData.endDate, spendingBarData.startDate, spendingBarData.carNumber],
    async () => {
      const { data } = await getAllSpendingBarData(spendingBarData);
      return data;
    }
  );

/**
 * Custom react hook to get all sponsor tiers
 *
 * @returns all the sponsor tiers
 */
export const useGetAllSponsorTiers = () => {
  return useQuery<SponsorTier[], Error>(['sponsor-tiers'], async () => {
    const { data } = await getAllSponsorTiers();
    return data;
  });
};

export const useEditSponsor = (sponsorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Sponsor, Error, SponsorPayload>(
    ['sponsor', 'edit'],
    async (formData: SponsorPayload) => {
      const { data } = await editSponsor(sponsorId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a sponsor task
 *
 * @returns the deleted sponsor
 */
export const useDeleteSponsorTask = () => {
  const queryClient = useQueryClient();
  return useMutation<SponsorTask, Error, DeleteSponsorTaskPaylaod>(
    async ({ sponsorTaskId }) => {
      const { data } = await deleteSponsorTask(sponsorTaskId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-task']);
      }
    }
  );
};

/**
 * Hook to delete the given sponsor tier
 * @param sponsorTierId sponsor tier to be deleted
 * @returns the deleted sponsor tier
 */
export const useDeleteSponsorTier = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, string>(
    ['sponsor-tier', 'delete'],
    async (sponsorTierId: string) => {
      const { data } = await deleteSponsorTier(sponsorTierId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-tiers']);
      }
    }
  );
};

/**
 * Custom React Hook to edit a sponsor tier
 *
 * @returns the edited sponsor tier
 */
export const useEditSponsorTier = (sponsorTierId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SponsorTier, Error, SponsorTierPayload>(
    ['sponsor-tier', 'edit'],
    async (formData: SponsorTierPayload) => {
      const { data } = await editSponsorTier(sponsorTierId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sponsor-tiers']);
      }
    }
  );
};
