import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Assembly, MaterialStatus, RoleEnum } from 'shared';
import * as yup from 'yup';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import {
  useCreateManufacturer,
  useGetAllManufacturers,
  useGetAllMaterialTypes,
  useGetAllUnits
} from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';
import { Decimal } from 'decimal.js';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import MaterialAdminWrapper from './MaterialAdminWrapper';
import MaterialHeadWrapper from './MaterialHeadWrapper';
import MaterialMemberWrapper from './MaterialMemberWrapper';

const schema = yup.object().shape({
  name: yup.string().required('Enter a name!'),
  status: yup.mixed<MaterialStatus>().oneOf(Object.values(MaterialStatus)).required('Select a status!'),
  materialTypeName: yup.string().required('Select a Material Type!'),
  manufacturerName: yup.string().required('Select a Manufacturer!'),
  manufacturerPartNumber: yup.string().required('Manufacturer Part Number is required!'),
  quantity: yup.number().required('Enter a quantity!'),
  price: yup.number().required('Price per Unit is required!'),
  unitName: yup.string().optional(),
  linkUrl: yup.string().required('URL is required!'),
  notes: yup.string().optional(),
  pdmFileName: yup.string().optional(),
  assemblyId: yup.string().optional(),
  reimbursementRequestId: yup.string().optional()
});

export interface MaterialFormInput {
  name: string;
  status: MaterialStatus;
  materialTypeName: string;
  manufacturerName: string;
  manufacturerPartNumber: string;
  pdmFileName?: string;
  price: number;
  quantity: number;
  unitName?: string;
  linkUrl: string;
  notes?: string;
  assemblyId?: string;
  reimbursementRequestId?: string;
}

export interface MaterialDataSubmission {
  name: string;
  status: MaterialStatus;
  materialTypeName: string;
  manufacturerName: string;
  manufacturerPartNumber: string;
  pdmFileName?: string;
  price: number;
  quantity: Decimal;
  unitName?: string;
  linkUrl: string;
  notes?: string;
  assemblyId?: string;
  subtotal: number;
  reimbursementRequestId?: string;
}

export interface MaterialFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: MaterialDataSubmission) => void;
  defaultValues?: MaterialFormInput;
  onHide: () => void;
  open: boolean;
  assemblies: Assembly[];
}

const MaterialForm: React.FC<MaterialFormProps> = ({ submitText, assemblies, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm<MaterialFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      status: defaultValues?.status ?? MaterialStatus.NotReadyToOrder,
      materialTypeName: defaultValues?.materialTypeName ?? '',
      manufacturerPartNumber: defaultValues?.manufacturerPartNumber ?? '',
      quantity: defaultValues?.quantity ?? 0,
      manufacturerName: defaultValues?.manufacturerName ?? '',
      pdmFileName: defaultValues?.pdmFileName,
      price: defaultValues?.price ?? 0,
      unitName: defaultValues?.unitName,
      linkUrl: defaultValues?.linkUrl ?? '',
      notes: defaultValues?.notes,
      assemblyId: defaultValues?.assemblyId,
      reimbursementRequestId: defaultValues?.reimbursementRequestId
    },
    resolver: yupResolver(schema)
  });

  const user = useCurrentUser();

  const { mutateAsync: createManufacturer, isLoading: isLoadingCreateManufacturer } = useCreateManufacturer();

  const {
    data: materialTypes,
    isLoading: isLoadingMaterialTypes,
    isError: materialTypesIsError,
    error: materialTypesError
  } = useGetAllMaterialTypes();

  const { data: units, isLoading: isLoadingUnits, isError: unitsIsError, error: unitsError } = useGetAllUnits();

  const {
    data: manufactuers,
    isLoading: isLoadingManufactuers,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllManufacturers();

  if (materialTypesIsError) return <ErrorPage message={materialTypesError.message} />;
  if (unitsIsError) return <ErrorPage message={unitsError.message} />;
  if (manufacturersIsError) return <ErrorPage message={manufacturersError.message} />;

  if (
    isLoadingManufactuers ||
    isLoadingMaterialTypes ||
    isLoadingUnits ||
    !materialTypes ||
    !units ||
    !manufactuers ||
    isLoadingCreateManufacturer
  ) {
    return <LoadingIndicator />;
  }

  const onSubmitWrapper = (data: MaterialFormInput): void => {
    const price = Math.round(data.price * 100);
    const subtotal = parseFloat((data.quantity * price).toFixed(2));
    onSubmit({ ...data, subtotal, price, quantity: new Decimal(data.quantity) });
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

  const sharedProps = {
    assemblies,
    allManufacturers: manufactuers,
    allMaterialTypes: materialTypes,
    allUnits: units,
    onSubmit: onSubmitWrapper,
    handleSubmit,
    submitText,
    onHide,
    control,
    errors,
    open,
    watch,
    createManufacturer: createManufacturerWrapper,
    setValue
  };

  if (user.role === RoleEnum.APP_ADMIN || user.role === RoleEnum.ADMIN) {
    return <MaterialAdminWrapper {...sharedProps} />;
  }
  if (user.role === RoleEnum.HEAD || user.role === RoleEnum.LEADERSHIP) {
    return <MaterialHeadWrapper {...sharedProps} />;
  }
  return <MaterialMemberWrapper {...sharedProps} />;
};

export default MaterialForm;
