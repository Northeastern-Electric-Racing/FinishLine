import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Assembly, MaterialStatus } from 'shared';
import * as yup from 'yup';
import {
  useCreateManufacturer,
  useGetAllManufacturers,
  useGetAllMaterialTypes,
  useGetAllUnits
} from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';
import { Decimal } from 'decimal.js';
import MaterialFormView from './MaterialFormView';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

const schema = yup.object().shape({
  name: yup.string().required('Enter a name!'),
  status: yup.mixed<MaterialStatus>().oneOf(Object.values(MaterialStatus)).required('Select a status!'),
  materialTypeName: yup.string().required('Select a Material Type!'),
  manufacturerName: yup.string().optional(),
  manufacturerPartNumber: yup.string().optional(),
  quantity: yup.number().optional(),
  price: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .optional(),
  unitName: yup.string().optional(),
  linkUrl: yup.string().optional(),
  notes: yup.string().optional(),
  pdmFileName: yup.string().optional(),
  assemblyId: yup.string().optional(),
  reimbursementRequestId: yup.string().optional()
});

export interface MaterialFormInput {
  name: string;
  status: MaterialStatus;
  materialTypeName: string;
  manufacturerName?: string;
  manufacturerPartNumber?: string;
  pdmFileName?: string;
  price?: number;
  quantity?: number;
  unitName?: string;
  linkUrl?: string;
  notes?: string;
  assemblyId?: string;
  reimbursementRequestId?: string;
}

export interface MaterialDataSubmission {
  name: string;
  status: MaterialStatus;
  materialTypeName: string;
  manufacturerName?: string;
  manufacturerPartNumber?: string;
  pdmFileName?: string;
  price?: number;
  quantity?: Decimal;
  unitName?: string;
  linkUrl?: string;
  notes?: string;
  assemblyId?: string;
  subtotal?: number;
  reimbursementRequestId?: string;
}

export interface MaterialFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: MaterialDataSubmission) => void;
  defaultValues?: MaterialFormInput;
  onHide: () => void;
  open: boolean;
  assemblies?: Assembly[];
  fromRRForm?: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  submitText,
  assemblies,
  onSubmit,
  defaultValues,
  onHide,
  open,
  fromRRForm = false
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm<MaterialFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      status: defaultValues?.status ?? (fromRRForm ? MaterialStatus.ReadyToOrder : MaterialStatus.NotReadyToOrder),
      materialTypeName: defaultValues?.materialTypeName ?? '',
      manufacturerPartNumber: defaultValues?.manufacturerPartNumber ?? '',
      quantity: defaultValues?.quantity ?? 1,
      manufacturerName: defaultValues?.manufacturerName ?? '',
      pdmFileName: defaultValues?.pdmFileName,
      price: defaultValues?.price,
      unitName: defaultValues?.unitName,
      linkUrl: defaultValues?.linkUrl ?? '',
      notes: defaultValues?.notes,
      assemblyId: defaultValues?.assemblyId,
      reimbursementRequestId: defaultValues?.reimbursementRequestId
    },
    resolver: yupResolver(schema)
  });

  const { mutateAsync: createManufacturer, isLoading: isLoadingCreateManufacturer } = useCreateManufacturer();

  const { data: materialTypes, isError: materialTypesIsError, error: materialTypesError } = useGetAllMaterialTypes();

  const { data: units, isError: unitsIsError, error: unitsError } = useGetAllUnits();

  const { data: manufactuers, isError: manufacturersIsError, error: manufacturersError } = useGetAllManufacturers();

  if (materialTypesIsError) return <ErrorPage message={materialTypesError.message} />;
  if (unitsIsError) return <ErrorPage message={unitsError.message} />;
  if (manufacturersIsError) return <ErrorPage message={manufacturersError.message} />;

  if (isLoadingCreateManufacturer) {
    return <LoadingIndicator />;
  }

  const onSubmitWrapper = (data: MaterialFormInput): void => {
    const price = data.price != null ? Math.round(data.price * 100) : undefined;
    const subtotal = price != null && data.quantity != null ? parseFloat((data.quantity * price).toFixed(2)) : undefined;
    onSubmit({ ...data, subtotal, price, quantity: data.quantity != null ? new Decimal(data.quantity) : undefined });
  };

  const createManufacturerWrapper = async (manufacturerName: string): Promise<void> => {
    try {
      const createdManufacturer = await createManufacturer({ name: manufacturerName });
      setValue('manufacturerName', createdManufacturer.name);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  return (
    <MaterialFormView
      assemblies={assemblies}
      allManufacturers={manufactuers}
      allMaterialTypes={materialTypes}
      allUnits={units}
      onSubmit={onSubmitWrapper}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      open={open}
      watch={watch}
      createManufacturer={createManufacturerWrapper}
      setValue={setValue}
      fromRRForm={fromRRForm}
    />
  );
};

export default MaterialForm;
