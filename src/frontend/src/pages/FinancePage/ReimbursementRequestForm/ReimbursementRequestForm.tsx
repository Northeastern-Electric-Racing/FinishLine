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
  WbsReimbursementProductCreateArgs,
  wbsPipe
} from 'shared';
import { useGetAllAccountCodes, useGetAllVendors } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateReimbursementRequestFormView from './ReimbursementFormView';
import { useHistory, useLocation } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { useCurrentUserSecureSettings } from '../../../hooks/users.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';

export interface ReimbursementRequestInformation {
  vendorId: string;
  dateOfExpense?: Date;
  accountCodeId: string;
  receiptFiles: ReimbursementReceiptUploadArgs[];
  indexCodeId: string;
  secondaryAccount?: string;
  description?: string;
}

export type ProductWithLocalFields = ReimbursementProductFormArgs & {
  __baseCost?: number;
  __shippingCost?: number;
};

export interface ReimbursementRequestFormInput extends ReimbursementRequestInformation {
  reimbursementProducts: ProductWithLocalFields[];
  splitShipping?: number;
}

export interface ReimbursementRequestDataSubmission extends ReimbursementRequestInformation {
  otherReimbursementProducts: OtherReimbursementProductCreateArgs[];
  wbsReimbursementProducts: WbsReimbursementProductCreateArgs[];
  totalCost: number;
}

interface ReimbursementRequestFormProps {
  submitText: 'Save' | 'Submit';
  submitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
  onFormExit?: () => void;
  defaultValues?: ReimbursementRequestFormInput;
  isLeadershipApproved?: boolean;
  onSubmitToFinance?: (data: ReimbursementRequestDataSubmission) => Promise<void>;
  isSubmitting?: boolean;
}

const RECEIPTS_REQUIRED = import.meta.env.VITE_RR_RECEIPT_REQUIREMENT || 'disabled';

const normalizeProductForForm = (product: ProductWithLocalFields): ProductWithLocalFields => {
  const totalCost = Number(product.cost ?? 0);

  // If shipping already exists, keep it.
  if (product.__baseCost !== undefined || product.__shippingCost !== undefined) {
    return {
      ...product,
      __baseCost: Number(product.__baseCost ?? totalCost - Number(product.__shippingCost ?? 0)),
      __shippingCost: Number(product.__shippingCost ?? 0),
      cost: totalCost
    };
  }

  // Existing requests probably only have total cost persisted.
  return {
    ...product,
    __baseCost: totalCost,
    __shippingCost: 0,
    cost: totalCost
  };
};

const schema = yup.object().shape({
  vendorId: yup.string().required('Vendor is required'),
  splitShipping: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' || originalValue === undefined ? undefined : value;
    })
    .optional()
    .min(0, 'Split shipping cannot be negative')
    .test('shipping-sum-matches', 'Total shipping must equal the sum of shipping across all items', function (value) {
      if (value === undefined || value === null) {
        return true;
      }

      const products = this.parent.reimbursementProducts ?? [];

      const itemShippingTotal = products.reduce(
        (sum: number, product: ProductWithLocalFields) => sum + Number(product.__shippingCost ?? 0),
        0
      );

      const expected = Number(value);

      return Math.abs(itemShippingTotal - expected) < 0.005;
    }),
  indexCodeId: yup.string().required('Refund source is required'),
  secondaryAccount: yup.string().test('required-if-split', 'Second refund source is required', function (value) {
    if (!this.parent.$hasConfirmedFinance) return true;
    if (!value) {
      return this.createError({
        message: 'Second refund source is required'
      });
    }

    const products = this.parent.reimbursementProducts || [];

    // Check that at least one product uses the first refund source
    const firstSourceUsed = products.some((product: any) => {
      const amount = product.refundSources?.[0]?.amount;
      return amount !== undefined && amount !== null && Number(amount) > 0;
    });

    if (!firstSourceUsed) {
      return this.createError({
        message: 'At least one product must use the first refund source',
        path: 'indexCodeId'
      });
    }

    // Check that at least one product uses the second refund source
    const secondSourceUsed = products.some((product: any) => {
      const amount = product.refundSources?.[1]?.amount;
      return amount !== undefined && amount !== null && Number(amount) > 0;
    });

    if (!secondSourceUsed) {
      return this.createError({
        message: 'At least one product must use the second refund source',
        path: 'secondaryAccount'
      });
    }

    return true;
  }),
  dateOfExpense: yup.date().optional(),
  accountCodeId: yup.string().required('Account code is required'),
  description: yup.string().optional(),
  reimbursementProducts: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Material / Description is required'),
        reason: yup.mixed().required(),
        refundSources: yup.array().of(
          yup.object({
            amount: yup
              .number()
              .transform((value, originalValue) => {
                // Treat empty string or undefined as 0
                return originalValue === '' || originalValue === undefined ? 0 : value;
              })
              .typeError('Amount must be a number')
              .min(0, 'Amount cannot be negative')
          })
        ),
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
      : yup.array().required('receipt files required').max(10, 'At most 10 Receipts are allowed')
    ).of(yup.mixed<ReimbursementReceiptUploadArgs>().required())
});

const ReimbursementRequestForm: React.FC<ReimbursementRequestFormProps> = ({
  submitText,
  defaultValues,
  submitData,
  onFormExit,
  isLeadershipApproved = false,
  onSubmitToFinance,
  isSubmitting = false
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
      description: defaultValues?.description?.trim() || '',
      reimbursementProducts:
        defaultValues?.reimbursementProducts?.map(normalizeProductForForm) ?? ([] as ProductWithLocalFields[]),
      receiptFiles: defaultValues?.receiptFiles ?? ([] as ReimbursementReceiptUploadArgs[]),
      splitShipping: undefined
    }
  });

  const { pathname } = useLocation();
  const urlTabInsert = pathname.includes('/all-requests') ? 'all-requests' : 'my-requests';

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
    prepend: reimbursementProductPrepend,
    remove: reimbursementProductRemove,
    replace: reimbursementProductReplace
  } = useFieldArray({
    control,
    name: 'reimbursementProducts'
  });

  const getGroupKey = (product: ProductWithLocalFields) =>
    'otherProductReasonId' in product.reason
      ? `other-${product.reason.otherProductReasonId}`
      : `wbs-${product.reason.carNumber}-${product.reason.projectNumber}`;

  const getBaseCost = (product: ProductWithLocalFields) => Number(product.__baseCost ?? product.cost ?? 0);

  const resetProductCosts = (product: ProductWithLocalFields): ProductWithLocalFields =>
    ({
      ...product,
      __baseCost: getBaseCost(product),
      __shippingCost: 0,
      cost: getBaseCost(product)
    }) as ReimbursementProductFormArgs;

  const allocateEvenly = (totalCents: number, count: number): number[] => {
    if (count <= 0) return [];
    const base = Math.floor(totalCents / count);
    const remainder = totalCents % count;
    return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
  };

  const allocateProportionally = (totalCents: number, weights: number[]): number[] => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalCents <= 0 || weights.length === 0) return weights.map(() => 0);
    if (totalWeight <= 0) return allocateEvenly(totalCents, weights.length);

    const exactShares = weights.map((weight) => (weight / totalWeight) * totalCents);
    const flooredShares = exactShares.map((share) => Math.floor(share));
    let remainingCents = totalCents - flooredShares.reduce((sum, cents) => sum + cents, 0);

    const remainders = exactShares
      .map((share, index) => ({
        index,
        remainder: share - Math.floor(share)
      }))
      .sort((a, b) => b.remainder - a.remainder);

    remainders.forEach(({ index }) => {
      if (remainingCents > 0) {
        flooredShares[index] += 1;
        remainingCents -= 1;
      }
    });

    return flooredShares;
  };

  const applySplitShippingToProducts = (totalShipping?: number) => {
    const currentProducts = watch('reimbursementProducts') ?? [];
    const resetProducts = currentProducts.map(resetProductCosts);

    const shippableProducts = resetProducts.filter((product) => !!product.name?.trim());

    if (!totalShipping || totalShipping <= 0 || shippableProducts.length === 0) {
      reimbursementProductReplace(resetProducts);
      return;
    }

    const groupedProducts = new Map<string, ProductWithLocalFields[]>();

    shippableProducts.forEach((product) => {
      const key = getGroupKey(product);
      if (!groupedProducts.has(key)) groupedProducts.set(key, []);
      groupedProducts.get(key)!.push(product);
    });

    const groupedEntries = Array.from(groupedProducts.values());
    const totalShippingCents = Math.round(totalShipping * 100);

    const projectShippingAllocations = allocateEvenly(totalShippingCents, groupedEntries.length);

    groupedEntries.forEach((productsInGroup, groupIndex) => {
      const materialShippingAllocations = allocateEvenly(projectShippingAllocations[groupIndex], productsInGroup.length);

      productsInGroup.forEach((product, productIndex) => {
        const shippingAmount = materialShippingAllocations[productIndex] / 100;
        const baseCost = getBaseCost(product);

        product.__shippingCost = shippingAmount;
        product.cost = baseCost + shippingAmount;
      });
    });

    reimbursementProductReplace(resetProducts);
  };

  const applyProportionalShippingToProducts = (totalShipping?: number) => {
    const currentProducts = watch('reimbursementProducts') ?? [];
    const resetProducts = currentProducts.map(resetProductCosts);

    const shippableProducts = resetProducts.filter((product) => !!product.name?.trim());

    if (!totalShipping || totalShipping <= 0 || shippableProducts.length === 0) {
      reimbursementProductReplace(resetProducts);
      return;
    }

    const groupedProducts = new Map<string, ProductWithLocalFields[]>();

    shippableProducts.forEach((product) => {
      const key = getGroupKey(product);
      if (!groupedProducts.has(key)) {
        groupedProducts.set(key, []);
      }
      groupedProducts.get(key)!.push(product);
    });

    const groupedEntries = Array.from(groupedProducts.values());
    const totalShippingCents = Math.round(totalShipping * 100);

    const projectBaseCosts = groupedEntries.map((productsInGroup) =>
      productsInGroup.reduce((sum, product) => sum + Math.round(getBaseCost(product) * 100), 0)
    );

    const projectShippingAllocations = allocateProportionally(totalShippingCents, projectBaseCosts);

    groupedEntries.forEach((productsInGroup, groupIndex) => {
      const materialBaseCosts = productsInGroup.map((product) => Math.round(getBaseCost(product) * 100));
      const materialShippingAllocations = allocateProportionally(projectShippingAllocations[groupIndex], materialBaseCosts);

      productsInGroup.forEach((product, productIndex) => {
        const shippingAmount = materialShippingAllocations[productIndex] / 100;
        const baseCost = getBaseCost(product);

        product.__shippingCost = shippingAmount;
        product.cost = baseCost + shippingAmount;
      });
    });

    reimbursementProductReplace(resetProducts);
  };

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
      //total cost, firstSourceAmount and secondSourceAmount is tracked in cents
      const totalCost = Math.round(data.reimbursementProducts.reduce((acc, curr) => acc + curr.cost, 0) * 100);

      const reimbursementProducts = data.reimbursementProducts.map((product: ProductWithLocalFields) => {
        const formattedRefundSources = (product.refundSources ?? []).filter(
          (rs) => rs?.indexCode?.indexCodeId && Number(rs.amount) > 0
        );
        const { __baseCost, __shippingCost, ...rest } = product;

        return {
          ...rest,
          cost: Math.round(product.cost * 100),
          refundSources: formattedRefundSources.map((rs) => ({
            ...rs,
            amount: Math.round(Number(rs.amount) * 100)
          }))
        };
      });

      const otherReimbursementProducts: OtherReimbursementProductCreateArgs[] = [];
      const wbsReimbursementProducts: WbsReimbursementProductCreateArgs[] = [];

      reimbursementProducts.forEach((product) => {
        if (product.reason && 'otherProductReasonId' in product.reason) {
          otherReimbursementProducts.push({
            reason: product.reason as OtherProductReason,
            cost: product.cost,
            name: product.name,
            refundSources: product.refundSources
          });
        } else {
          wbsReimbursementProducts.push({
            reason: product.reason as WbsNumber,
            cost: product.cost,
            name: product.name,
            materialId: product.materialId,
            refundSources: product.refundSources
          });
        }
      });

      const reimbursementRequestId = await submitData({
        ...data,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        totalCost
      });
      history.push(`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${reimbursementRequestId}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 5000);
      }
    }
  };

  const projectAutocompleteOptions = allProjects.map((proj) => ({
    label: wbsPipe(proj.wbsNum) + ' - ' + proj.name,
    id: wbsPipe(proj.wbsNum)
  }));

  const onSubmitToFinanceWrapper = onSubmitToFinance
    ? async (data: ReimbursementRequestFormInput) => {
        try {
          const totalCost = Math.round(data.reimbursementProducts.reduce((acc, curr) => acc + curr.cost, 0) * 100);
          const reimbursementProducts = data.reimbursementProducts.map((product: ProductWithLocalFields) => {
            const formattedRefundSources = (product.refundSources ?? []).filter(
              (rs) => rs?.indexCode?.indexCodeId && Number(rs.amount) > 0
            );
            const { __baseCost, __shippingCost, ...rest } = product;

            return {
              ...rest,
              cost: Math.round(product.cost * 100),
              refundSources: formattedRefundSources.map((rs) => ({
                ...rs,
                amount: Math.round(Number(rs.amount) * 100)
              }))
            };
          });

          const otherReimbursementProducts: OtherReimbursementProductCreateArgs[] = [];
          const wbsReimbursementProducts: WbsReimbursementProductCreateArgs[] = [];

          reimbursementProducts.forEach((product) => {
            if (product.reason && 'otherProductReasonId' in product.reason) {
              otherReimbursementProducts.push({
                reason: product.reason as OtherProductReason,
                cost: product.cost,
                name: product.name,
                refundSources: product.refundSources
              });
            } else {
              wbsReimbursementProducts.push({
                reason: product.reason as WbsNumber,
                cost: product.cost,
                name: product.name,
                materialId: product.materialId,
                refundSources: product.refundSources
              });
            }
          });

          await onSubmitToFinance({
            ...data,
            otherReimbursementProducts,
            wbsReimbursementProducts,
            totalCost
          });
        } catch (e: unknown) {
          if (e instanceof Error) {
            toast.error(e.message, 5000);
          }
        }
      }
    : undefined;

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
      reimbursementProductPrepend={reimbursementProductPrepend}
      reimbursementProductRemove={reimbursementProductRemove}
      onSubmit={onSubmitWrapper}
      handleSubmit={handleSubmit}
      allProjects={allProjects}
      projectAutocompleteOptions={projectAutocompleteOptions}
      submitText={submitText}
      setValue={setValue}
      hasSecureSettingsSet={hasSecureSettingsSet}
      register={register}
      onFormExit={onFormExit}
      isEditing={!!defaultValues}
      isLeadershipApproved={isLeadershipApproved}
      onSubmitToFinance={onSubmitToFinanceWrapper}
      isSubmitting={isSubmitting}
      applySplitShippingToProducts={applySplitShippingToProducts}
      applyProportionalShippingToProducts={applyProportionalShippingToProducts}
    />
  );
};

export default ReimbursementRequestForm;
