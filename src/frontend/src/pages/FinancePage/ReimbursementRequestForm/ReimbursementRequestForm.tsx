/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useFieldArray, useForm } from 'react-hook-form';
import { ClubAccount, ReimbursementProductCreateArgs, ReimbursementReceiptUploadArgs, WbsNumber } from 'shared';
import { useGetAllExpenseTypes, useGetAllVendors } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateReimbursementRequestFormView from './ReimbursementFormView';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';

export interface ReimbursementRequestFormInput {
  vendorId: string;
  account: ClubAccount;
  dateOfExpense: Date;
  expenseTypeId: string;
  reimbursementProducts: ReimbursementProductCreateArgs[];
  receiptFiles: ReimbursementReceiptUploadArgs[];
}

export interface ReimbursementRequestDataSubmission extends ReimbursementRequestFormInput {
  totalCost: number;
}

interface ReimbursementRequestFormProps {
  submitText: string;
  submitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
  defaultValues?: ReimbursementRequestFormInput;
  previousPage: string;
}

const schema = yup.object().shape({
  vendorId: yup.string().required('Vendor is required'),
  account: yup.string().required('Account is required'),
  dateOfExpense: yup.date().required('Date of Expense is required'),
  expenseTypeId: yup.string().required('Expense Type is required'),
  reimbursementProducts: yup
    .array()
    .of(
      yup.object().shape({
        wbsNum: yup.object().required('WBS Number is required'),
        name: yup.string().required('Description is required'),
        cost: yup.number().required('Amount is required').min(1, 'Amount must be greater than 0')
      })
    )
    .required('reimbursement products required')
    .min(1, 'At least one Reimbursement Product is required'),
  receiptFiles: yup.array().required('receipt files required').min(1, 'At least one Receipt is required')
});

const ReimbursementRequestForm: React.FC<ReimbursementRequestFormProps> = ({ submitText, defaultValues, submitData, previousPage }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vendorId: defaultValues?.vendorId ?? '',
      account: defaultValues?.account ?? ClubAccount.CASH,
      dateOfExpense: defaultValues?.dateOfExpense ?? new Date(),
      expenseTypeId: defaultValues?.expenseTypeId ?? '',
      reimbursementProducts: defaultValues?.reimbursementProducts ?? ([] as ReimbursementProductCreateArgs[]),
      receiptFiles: defaultValues?.receiptFiles ?? ([] as ReimbursementReceiptUploadArgs[])
    }
  });

  const {
    fields: receiptFiles,
    append: receiptAppend,
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
    isLoading: allExpenseTypesIsLoading,
    isError: allExpenseTypesIsError,
    error: allExpenseTypesError,
    data: allExpenseTypes
  } = useGetAllExpenseTypes();

  const {
    isLoading: allProjectsIsLoading,
    isError: allProjectsIsError,
    error: allProjectsError,
    data: allProjects
  } = useAllProjects();

  const toast = useToast();
  const history = useHistory();
  const totalCost = reimbursementProducts.reduce((acc, curr) => Number(acc) + Number(curr.cost), 0);

  if (allVendorsIsError) return <ErrorPage message={allVendorsError?.message} />;
  if (allExpenseTypesIsError) return <ErrorPage message={allExpenseTypesError?.message} />;
  if (allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;

  if (
    allExpenseTypesIsLoading ||
    allVendorsIsLoading ||
    allProjectsIsLoading ||
    !allVendors ||
    !allExpenseTypes ||
    !allProjects
  )
    return <LoadingIndicator />;

  const onSubmitWrapper = async (data: ReimbursementRequestFormInput) => {
    try {
      const reimbursementRequestId = await submitData({
        ...data,
        totalCost: totalCost
      });
      history.push(routes.FINANCE + '/' + reimbursementRequestId);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const allWbsElements: {
    wbsNum: WbsNumber;
    wbsName: string;
  }[] = allProjects
    .map((project) => {
      return {
        wbsNum: project.wbsNum,
        wbsName: project.name
      };
    })
    .concat(
      allProjects.flatMap((project) =>
        project.workPackages.map((workPackage) => {
          return {
            wbsNum: workPackage.wbsNum,
            wbsName: workPackage.projectName + ' - ' + workPackage.name
          };
        })
      )
    );

  return (
    <CreateReimbursementRequestFormView
      errors={errors}
      allVendors={allVendors}
      allExpenseTypes={allExpenseTypes}
      receiptFiles={receiptFiles}
      control={control}
      reimbursementProducts={reimbursementProducts}
      receiptAppend={receiptAppend}
      receiptRemove={receiptRemove}
      reimbursementProductAppend={reimbursementProductAppend}
      reimbursementProductRemove={reimbursementProductRemove}
      onSubmit={onSubmitWrapper}
      handleSubmit={handleSubmit}
      allWbsElements={allWbsElements}
      totalCost={totalCost}
      submitText={submitText}
      previousPage={previousPage}
    />
  );
};

export default ReimbursementRequestForm;
