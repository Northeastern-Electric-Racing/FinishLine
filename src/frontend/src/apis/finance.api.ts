/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  CreateReimbursementRequestPayload,
  EditReimbursementRequestPayload,
  ExpenseTypePayload
} from '../hooks/finance.hooks';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  reimbursementRequestTransformer,
  reimbursementTransformer,
  vendorTransformer
} from './transformers/reimbursement-requests.transformer';
import { saveAs } from 'file-saver';
import { PDFDocument, PDFImage } from 'pdf-lib';
import { ExpenseType } from 'shared';

enum AllowedFileType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  PDF = 'application/pdf'
}

/**
 * Upload a picture of a receipt
 *
 * @param payload Payload containing the image data
 */
export const uploadSingleReceipt = (file: File, id: string) => {
  const formData = new FormData();
  formData.append('image', file);
  return axios.post(apiUrls.financeUploadRceipt(id), formData);
};

/**
 * Creates a new reimbursement request
 *
 * @param formData the data to create a new reimbursement request
 * @returns the created reimbursement request
 */
export const createReimbursementRequest = (formData: CreateReimbursementRequestPayload) => {
  return axios.post(apiUrls.financeCreateReimbursementRequest(), formData);
};

/**
 * Mark a Reimbursement Request as Delivered
 *
 * @param id id of the reimbursement request being marked as delivered
 * @returns the updated reimbursement request
 */
export const markReimbursementRequestAsDelivered = (id: string) => {
  return axios.post(apiUrls.financeMarkAsDelivered(id));
};

/**
 * Edits a reimbursment request
 *
 * @param id the id of the reimbursement request to edit
 * @param formData the data to edit the reimbursement request with
 * @returns the edited reimbursement request
 */
export const editReimbursementRequest = (id: string, formData: EditReimbursementRequestPayload) => {
  return axios.post(apiUrls.financeEditReimbursementRequest(id), formData);
};

/**
 * Deletes a reimbursement request
 *
 * @param id the id of the reimbursement request to delete
 * @returns the deleted reimbursement request
 */
export const deleteReimbursementRequest = (id: string) => {
  return axios.delete(apiUrls.financeDeleteReimbursement(id));
};

/**
 * Gets all the expense types
 *
 * @returns all the expense types
 */
export const getAllExpenseTypes = () => {
  return axios.get(apiUrls.getAllExpenseTypes(), {
    transformResponse: (data) => {
      return JSON.parse(data) as ExpenseType[];
    }
  });
};

/**
 * Gets all the vendors
 *
 * @returns all the vendors
 */
export const getAllVendors = () => {
  return axios.get(apiUrls.getAllVendors(), {
    transformResponse: (data) => JSON.parse(data).map(vendorTransformer)
  });
};

/**
 * Gets a single reimbursement request
 *
 * @param id the id of the reimbursement request to get
 * @returns the reimbursement request with the given id
 */
export const getSingleReimbursementRequest = (id: string) => {
  return axios.get(apiUrls.financeReimbursementRequestById(id), {
    transformResponse: (data) => reimbursementRequestTransformer(JSON.parse(data))
  });
};

/**
 * Get the reimbursement requests for the current user
 */
export const getCurrentUserReimbursementRequests = () => {
  return axios.get(apiUrls.financeGetUserReimbursementRequest(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementRequestTransformer)
  });
};

/**
 * Gets all the reimbursement requests
 */
export const getAllReimbursementRequests = () => {
  return axios.get(apiUrls.financeEndpoints(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementRequestTransformer)
  });
};

/**
 * Gets all the reimbursements for a user
 */
export const getCurrentUserReimbursements = () => {
  return axios.get(apiUrls.financeGetUserReimbursements(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementTransformer)
  });
};

/**
 * Gets all reimbursements
 */
export const getAllReimbursements = () => {
  return axios.get(apiUrls.financeGetAllReimbursements(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementTransformer)
  });
};

/**
 * Approve Reimbursement Request (set it to Sabo Submitted)
 *
 * @param id of the reimbursement request being approved by finance
 * @returns the sabo submitted reimbursement status
 */
export const approveReimbursementRequest = (id: string) => {
  return axios.post(apiUrls.financeApproveReimbursementRequest(id));
};

/**
 * Deny Reimbursement Request
 *
 * @param id of the reimbursement request being denied by finance
 * @returns the denied reimbursement status
 */
export const denyReimbursementRequest = (id: string) => {
  return axios.post(apiUrls.financeDenyReimbursementRequest(id));
};

/**
 * Downloads a given fileId from google drive into a blob
 *
 * @param fileId the google id of the file to download
 * @returns the downloaded file as a Blob
 */
export const downloadGoogleImage = async (fileId: string): Promise<Blob> => {
  const response = await axios.get(apiUrls.financeImageById(fileId), {
    responseType: 'arraybuffer' // Set the response type to 'arraybuffer' to receive the image as a Buffer
  });
  const imageBuffer = new Uint8Array(response.data);
  const imageBlob = new Blob([imageBuffer], { type: response.headers['content-type'] });
  return imageBlob;
};

/**
 * Download blobs of image data into a pdf
 *
 * @param blobData an array of blob image data
 * @param filename the name of the created pdf
 */
export const downloadBlobsToPdf = async (blobData: Blob[], filename: string) => {
  const pdfDoc = await PDFDocument.create();

  const addImage = (image: PDFImage) => {
    const page = pdfDoc.addPage([image.width, image.height]);
    const { width, height } = page.getSize();
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height
    });
  };

  // Embed the image in the PDF document
  const promises = blobData.map(async (blob: Blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    switch (blob.type) {
      case AllowedFileType.JPEG: {
        const image = await pdfDoc.embedJpg(arrayBuffer);
        addImage(image);
        break;
      }
      case AllowedFileType.PNG: {
        const image = await pdfDoc.embedPng(arrayBuffer);
        addImage(image);
        break;
      }
      case AllowedFileType.PDF: {
        const newPdf = await PDFDocument.load(arrayBuffer);
        const newPages = await pdfDoc.copyPages(newPdf, newPdf.getPageIndices());
        // Add the pages to the main PDF
        newPages.forEach((page) => {
          pdfDoc.addPage(page);
        });
        break;
      }
      default: {
        throw new Error(blob.type + ' type not supported');
      }
    }
  });

  await Promise.all(promises);

  // Save the PDF as an ArrayBuffer
  const pdfBytes = await pdfDoc.save();

  // Convert the ArrayBuffer to a Blob
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  // Save the Blob as a file using file-saver
  saveAs(pdfBlob, filename);
};

/**
 * API call to get the list of Reimbursement Requests that are pending advisor approval
 *
 * @returns The list of Reimbursement Requests that are pending advisor approval
 */
export const getPendingAdvisorList = () => {
  return axios.get(apiUrls.financeGetPendingAdvisorList(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementRequestTransformer)
  });
};

/**
 * Set a reimbursement request's SABO number
 *
 * @param requestId the request ID
 * @param saboNumber the SABO number to set
 */
export const setSaboNumber = async (requestId: string, saboNumber: number) => {
  axios.post(apiUrls.financeSetSaboNumber(requestId), {
    saboNumber
  });
};

/**
 * API Call to send the list of Reimbursement Requests that are pending advisor approval
 *
 * @param saboNumbers The sabo numbers of the reimbursement requests to request approval for
 * @returns the response from the backend
 */
export const sendPendingAdvisorList = (saboNumbers: number[]) => {
  return axios.post(apiUrls.financeSendPendingAdvisorList(), {
    saboNumbers
  });
};

/**
 * Reports a given dollar amount representing a new account credit
 *
 * @param amount the dollar amount being reimbursed
 * @param dateReceived the date the refund was received
 * @returns a reimbursement with the given dollar amount
 */
export const reportRefund = (amount: number, dateReceived: string) => {
  return axios.post(apiUrls.financeReportRefund(), { amount, dateReceived });
};

/**
 * Edits an expense type in the database
 * @param id id of the expense type
 * @param accountCodeData the edited data of the expense type
 * @returns the updated expense type
 */
export const editAccountCode = async (id: string, accountCodeData: ExpenseTypePayload) => {
  return axios.post(apiUrls.financeEditExpenseType(id), accountCodeData);
};

/**
 * Creates an expense type in the database
 * @param accountCodeData the data for the expense type
 * @returns the new expense type
 */
export const createAccountCode = async (accountCodeData: ExpenseTypePayload) => {
  return axios.post(apiUrls.financeCreateExpenseType(), accountCodeData);
};

/**
 * Creates a vendor in the database
 * @param vendorData the data for the vendor
 * @returns the new vendor
 */
export const createVendor = async (vendorData: { name: string }) => {
  return axios.post(apiUrls.financeCreateVendor(), vendorData);
};
