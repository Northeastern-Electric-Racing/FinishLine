/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  approveReimbursementRequest,
  createReimbursementRequest,
  deleteReimbursementRequest,
  denyReimbursementRequest,
  downloadBlobsToPdf,
  downloadGoogleImage,
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
  reportRefund,
  sendPendingAdvisorList,
  setSaboNumber,
  uploadSingleReceipt,
  editAccountCode,
  createAccountCode,
  createVendor,
  editVendor,
  getAllAccountCodes,
  editRefund,
  leadershipApproveReimbursementRequest,
  requestReimbursementRequestChanges,
  markPendingFinance
} from '../apis/finance.api';
import {
  ClubAccount,
  AccountCode,
  Reimbursement,
  ReimbursementReceiptCreateArgs,
  ReimbursementRequest,
  Vendor,
  ReimbursementStatus,
  OtherReimbursementProductCreateArgs,
  WbsReimbursementProductCreateArgs,
  ReimbursementStatusType
} from 'shared';
import { fullNamePipe } from '../utils/pipes';

export interface CreateReimbursementRequestPayload {
  vendorId: string;
  dateOfExpense?: Date;
  accountCodeId: string;
  otherReimbursementProducts: OtherReimbursementProductCreateArgs[];
  wbsReimbursementProducts: WbsReimbursementProductCreateArgs[];
  totalCost: number;
  account: ClubAccount;
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
  allowedRefundSources: ClubAccount[];
}

export interface EditVendorPayload {
  name: string;
}

export interface RefundPayload {
  amount: number;
  dateReceived: string;
}

/**
 * Custom React Hook to upload a new picture.
 */
export const useUploadSingleReceipt = () => {
  return useMutation<{ googleFileId: string; name: string }, Error, { file: File; id: string }>(
    ['reimbursement-requsts', 'edit'],
    async (formData: { file: File; id: string }) => {
      const { data } = await uploadSingleReceipt(formData.file, formData.id);
      return data;
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
      const promises = formData.files.map((file) => uploadSingleReceipt(file, formData.id));
      const results = await Promise.all(promises);
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
 * Custom React Hook to get the reimbursement requests for the current user
 */
export const useCurrentUserReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'user'], async () => {
    const { data } = await getCurrentUserReimbursementRequests();
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
  return useMutation<ReimbursementRequest, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await markReimbursementRequestAsDelivered(id);
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
 * Custom react hook to approve a reimbursement request for the finance team
 *
 * @param id id of the reimbursement request to approve
 * @returns the created sabo submitted reimbursement status
 */
export const useApproveReimbursementRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ReimbursementStatus, Error>(
    ['reimbursement-requests', 'edit'],
    async () => {
      const { data } = await approveReimbursementRequest(id);
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
      return downloadGoogleImage(fileId);
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
      'SABO ID,Recipient,Total Cost,Status,Account,Account Code,Date Created,Date Delivered,Date Submitted,Vendor\n' +
      data
        .map(
          (rr) =>
            `${rr.saboId},${fullNamePipe(rr.recipient)},${rr.totalCost},${
              rr.reimbursementStatuses[rr.reimbursementStatuses.length - 1].type
            },${rr.account},${rr.accountCode.code},${rr.dateCreated},${rr.dateDelivered ?? ''},${
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
  return useMutation<Vendor, Error, { name: string }>(['vendors', 'create'], async (vendorData: { name: string }) => {
    const { data } = await createVendor(vendorData);
    queryClient.invalidateQueries(['vendors']);
    return data;
  });
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
