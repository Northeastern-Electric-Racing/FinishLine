/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useFieldArray, useForm } from 'react-hook-form';
import {
  ClubAccount,
  OtherProductReason,
  OtherReimbursementProductCreateArgs,
  ReimbursementProductFormArgs,
  ReimbursementReceiptUploadArgs,
  WbsNumber,
  WbsReimbursementProductCreateArgs
} from 'shared';
import { useGetAllAccountCodes, useGetAllVendors } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateReimbursementRequestFormView from './ReimbursementFormView';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { useCurrentUserSecureSettings } from '../../../hooks/users.hooks';

export interface ReimbursementRequestInformation {
  vendorId: string;
  dateOfExpense: Date;
  accountCodeId: string;
  receiptFiles: ReimbursementReceiptUploadArgs[];
  account: ClubAccount | undefined;
}
export interface ReimbursementRequestFormInput extends ReimbursementRequestInformation {
  reimbursementProducts: ReimbursementProductFormArgs[];
}

export interface ReimbursementRequestDataSubmission extends ReimbursementRequestInformation {
  otherReimbursementProducts: OtherReimbursementProductCreateArgs[];
  wbsReimbursementProducts: WbsReimbursementProductCreateArgs[];
  totalCost: number;
}

interface ReimbursementRequestFormProps {
  submitText: 'Save' | 'Submit';
  submitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
  defaultValues?: ReimbursementRequestFormInput;
  previousPage: string;
}

const RECEIPTS_REQUIRED = import.meta.env.VITE_RR_RECEIPT_REQUIREMENT || 'disabled';

const schema = yup.object().shape({
  vendorId: yup.string().required('Vendor is required'),
  account: yup.string().required('Account is required'),
  dateOfExpense: yup.date().required('Date of Expense is required'),
  accountCodeId: yup.string().required('Account code is required'),
  reimbursementProducts: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Description is required'),
        cost: yup
          .number()
          .typeError('Amount is required')
          .required('Amount is required')
          .min(0.01, 'Amount must be greater than 0')
      })
    )
    .required('reimbursement products required')
    .min(1, 'At least one Reimbursement Product is required'),
  receiptFiles:
    // The requirements for receipt uploads is disabled by default on development to make testing easier;
    // if testing proper receipt uploads is needed, create an environment variable called VITE_RR_RECEIPT_REQUIREMENT
    // in src/frontend/.env and set it to 'enabled'.
    import.meta.env.MODE === 'development' && RECEIPTS_REQUIRED !== 'enabled'
      ? yup.array()
      : yup.array().required('receipt files required').max(7, 'At most 7 Receipts are allowed')
});

const ReimbursementRequestForm: React.FC<ReimbursementRequestFormProps> = ({
  submitText,
  defaultValues,
  submitData,
  previousPage
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vendorId: defaultValues?.vendorId ?? '',
      account: defaultValues?.account,
      dateOfExpense: defaultValues?.dateOfExpense ?? new Date(),
      accountCodeId: defaultValues?.accountCodeId ?? '',
      reimbursementProducts: defaultValues?.reimbursementProducts ?? ([] as ReimbursementProductFormArgs[]),
      receiptFiles: defaultValues?.receiptFiles ?? ([] as ReimbursementReceiptUploadArgs[])
    }
  });

  const {
    fields: receiptFiles,
    prepend: receiptPrepend,
    remove: receiptRemove
  } = useFieldArray({
    control,
    name: 'receiptFiles'
  });
  const {
    fields: reimbursementProducts,
    append: reimbursementProductAppend,
    remove: reimbursementProductRemove
  } = useFieldArray({
    control,
    name: 'reimbursementProducts'
  });

  const {
    isLoading: allVendorsIsLoading,
    isError: allVendorsIsError,
    error: allVendorsError,
    data: allVendors
  } = useGetAllVendors();
  const {
    isLoading: allAccountCodesIsLoading,
    isError: allAccountCodesIsError,
    error: allAccountCodesError,
    data: allAccountCodes
  } = useGetAllAccountCodes();

  const {
    isLoading: allProjectsIsLoading,
    isError: allProjectsIsError,
    error: allProjectsError,
    data: allProjects
  } = useAllProjects();

  // checking the data here instead of using isError since function doesn't ever return an error
  const { data: userSecureSettings, isLoading: checkSecureSettingsIsLoading } = useCurrentUserSecureSettings();

  // checks to make sure none of the secure settings fields are empty, indicating not properly set
  const hasSecureSettingsSet = Object.values(userSecureSettings ?? {}).every((x) => x !== '');

  const toast = useToast();
  const history = useHistory();

  if (allVendorsIsError) return <ErrorPage message={allVendorsError?.message} />;
  if (allAccountCodesIsError) return <ErrorPage message={allAccountCodesError?.message} />;
  if (allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;

  if (
    allAccountCodesIsLoading ||
    allVendorsIsLoading ||
    allProjectsIsLoading ||
    !allVendors ||
    !allAccountCodes ||
    !allProjects ||
    checkSecureSettingsIsLoading
  )
    return <LoadingIndicator />;

  const onSubmitWrapper = async (data: ReimbursementRequestFormInput) => {
    try {
      //total cost is tracked in cents
      const totalCost = Math.round(data.reimbursementProducts.reduce((acc, curr) => acc + curr.cost, 0) * 100);
      const reimbursementProducts = data.reimbursementProducts.map((product: ReimbursementProductFormArgs) => {
        return { ...product, cost: Math.round(product.cost * 100) };
      });

      const otherReimbursementProducts: OtherReimbursementProductCreateArgs[] = [];
      const wbsReimbursementProducts: WbsReimbursementProductCreateArgs[] = [];

      reimbursementProducts.forEach((product) => {
        if (product.reason instanceof Object) {
          wbsReimbursementProducts.push({
            reason: product.reason as WbsNumber,
            cost: product.cost,
            name: product.name
          });
        } else {
          otherReimbursementProducts.push({
            reason: product.reason as OtherProductReason,
            cost: product.cost,
            name: product.name
          });
        }
      });

      const reimbursementRequestId = await submitData({
        ...data,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        totalCost
      });
      history.push(routes.FINANCE + '/' + reimbursementRequestId);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 5000);
      }
    }
  };

  const allProjectWbsElements = allProjects.map((proj) => {
    return {
      wbsNum: proj.wbsNum,
      wbsName: proj.name
    };
  });

  return (
    <CreateReimbursementRequestFormView
      watch={watch}
      errors={errors}
      allVendors={allVendors}
      allAccountCodes={allAccountCodes}
      receiptFiles={receiptFiles}
      control={control}
      reimbursementProducts={reimbursementProducts}
      receiptPrepend={receiptPrepend}
      receiptRemove={receiptRemove}
      reimbursementProductAppend={reimbursementProductAppend}
      reimbursementProductRemove={reimbursementProductRemove}
      onSubmit={onSubmitWrapper}
      handleSubmit={handleSubmit}
      allWbsElements={allProjectWbsElements}
      submitText={submitText}
      previousPage={previousPage}
      setValue={setValue}
      hasSecureSettingsSet={hasSecureSettingsSet}
    />
  );
};

export default ReimbursementRequestForm;
