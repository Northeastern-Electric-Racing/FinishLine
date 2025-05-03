/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useFieldArray, useForm } from 'react-hook-form';
import {
  OtherProductReason,
  OtherReimbursementProductCreateArgs,
  ReimbursementProductFormArgs,
  ReimbursementReceiptUploadArgs,
  WbsNumber,
  WbsReimbursementProductCreateArgs
} from 'shared';
import { useGetAllAccountCodes, useGetAllIndexCodes, useGetAllVendors } from '../../../hooks/finance.hooks';
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
  dateOfExpense?: Date;
  accountCodeId: string;
  receiptFiles: ReimbursementReceiptUploadArgs[];
  indexCodeId: string;
  secondaryAccount?: string;
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
  indexCodeId: yup.string().required('Refund source is required'),
  secondaryAccount: yup.string().test('required-if-split', 'Second refund source is required', function (value) {
    if (!this.parent.$hasConfirmedFinance) return true;
    if (!value) {
      return this.createError({
        message: 'Second refund source is required'
      });
    }

    const products = this.parent.reimbursementProducts || [];
    for (const product of this.parent.reimbursementProducts) {
      if (product.firstSourceAmount === undefined) {
        return this.createError({
          message: 'Amount is required',
          path: `reimbursementProducts.${products.indexOf(product)}.firstSourceAmount`
        });
      }
      if (product.secondSourceAmount === undefined) {
        return this.createError({
          message: 'Amount is required',
          path: `reimbursementProducts.${products.indexOf(product)}.secondSourceAmount`
        });
      }
    }
    return true;
  }),
  dateOfExpense: yup.date().optional(),
  accountCodeId: yup.string().required('Account code is required'),
  reimbursementProducts: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Description is required'),
        firstSourceAmount: yup.number().typeError('Amount must be a number').min(0, 'Amount cannot be negative'),
        secondSourceAmount: yup.number().typeError('Amount must be a number').min(0, 'Amount cannot be negative'),
        cost: yup
          .number()
          .required('Cost is required')
          .typeError('Amount must be a number')
          .min(0.01, 'Amount cannot be negative or less than zero')
      })
    )
    .required('Reimbursement products required')
    .min(1, 'At least one Reimbursement Product is required'),
  receiptFiles:
    // The requirements for receipt uploads is disabled by default on development to make testing easier;
    // if testing proper receipt uploads is needed, create an environment variable called VITE_RR_RECEIPT_REQUIREMENT
    // in src/frontend/.env and set it to 'enabled'.
    (import.meta.env.MODE === 'development' && RECEIPTS_REQUIRED !== 'enabled'
      ? yup.array()
      : yup.array().required('receipt files required').max(7, 'At most 7 Receipts are allowed')
    ).of(yup.mixed<ReimbursementReceiptUploadArgs>().required())
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
    setValue,
    register
  } = useForm<ReimbursementRequestFormInput>({
    resolver: yupResolver(schema as any), // Typing any because its difficult to get around the env variable for the reimbursement files
    defaultValues: {
      vendorId: defaultValues?.vendorId ?? '',
      indexCodeId: defaultValues?.indexCodeId,
      secondaryAccount: defaultValues?.secondaryAccount,
      dateOfExpense: defaultValues?.dateOfExpense,
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
  const { data: indexCodes } = useGetAllIndexCodes();

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
      //total cost, firstSourceAmount and secondSourceAmount is tracked in cents
      const totalCost = Math.round(data.reimbursementProducts.reduce((acc, curr) => acc + curr.cost, 0) * 100);
      // For each product, if multiple refund sources are enabled, the `cost` field represents
      // the total amount from the first refund source amount (firstSourceAmount) and second refund source (secondSourceAmount) of that product.
      // If only one refund source is present, the `cost` reflects the refund source amount for that product, and firstSourceAmount and secondSourceAmount are left as 0 since they will not needed for this scenario.

      const reimbursementProducts = data.reimbursementProducts.map((product: ReimbursementProductFormArgs) => {
        return {
          ...product,
          cost: Math.round(product.cost * 100),
          firstSourceAmount: (product.firstSourceAmount ?? 0) * 100,
          secondSourceAmount: (product.secondSourceAmount ?? 0) * 100
        };
      });

      const otherReimbursementProducts: OtherReimbursementProductCreateArgs[] = [];
      const wbsReimbursementProducts: WbsReimbursementProductCreateArgs[] = [];

      // find our index code
      const indexCode = indexCodes?.find((code) => code.indexCodeId === data.indexCodeId);

      reimbursementProducts.forEach((product) => {
        let firstSourceBudget = product.firstSourceAmount;
        let secondSourceBudget = product.secondSourceAmount;

        // Slightly messy fix to deal with the fact that while we only have 2 sources,
        // their order in the form is not guaranteed to be the same every time.
        // Therefore, this just makes a check to see if they need to be swapped for display purposes.
        // Note: firstSourceAmount and secondSourceAmount should really be changed to budgetAmount and cashAmount
        // in the future.
        if (indexCode?.name === 'CASH') {
          firstSourceBudget = product.secondSourceAmount;
          secondSourceBudget = product.firstSourceAmount;
        }

        if (product.reason && 'otherProductReasonId' in product.reason) {
          otherReimbursementProducts.push({
            reason: product.reason as OtherProductReason,
            cost: product.cost,
            name: product.name,
            firstSourceAmount: firstSourceBudget,
            secondSourceAmount: secondSourceBudget
          });
        } else {
          wbsReimbursementProducts.push({
            reason: product.reason as WbsNumber,
            cost: product.cost,
            name: product.name,
            firstSourceAmount: firstSourceBudget,
            secondSourceAmount: secondSourceBudget
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
      register={register}
    />
  );
};

export default ReimbursementRequestForm;
