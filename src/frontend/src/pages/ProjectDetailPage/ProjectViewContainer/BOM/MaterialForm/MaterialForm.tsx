import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Assembly, MaterialStatus } from 'shared';
import * as yup from 'yup';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import {
  useCreateManufacturer,
  useGetAllManufacturers,
  useGetAllMaterialTypes,
  useGetAllUnits
} from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';
import MaterialFormView from './MaterialFormView';
import { Decimal } from 'decimal.js';

const schema = yup.object({
  name: yup.string().required('Enter a name!'),
  status: yup.mixed<MaterialStatus>().oneOf(Object.values(MaterialStatus)).required('Select a status!'),
  materialTypeName: yup
    .string()
    .transform((value) => value || null)
    .nullable()
    .when('status', {
      is: MaterialStatus.NotReadyToOrder,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required('Select a Material Type!')
    }),
  manufacturerName: yup
    .string()
    .transform((value) => value || null)
    .nullable()
    .when('status', {
      is: MaterialStatus.NotReadyToOrder,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required('Select a Manufacturer')
    }),
  manufacturerPartNumber: yup
    .string()
    .transform((value) => value || null)
    .nullable()
    .when('status', {
      is: MaterialStatus.NotReadyToOrder,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required('Manufacturer Part Number is required!')
    }),
  quantity: yup.number().required(),
  price: yup.number().required(),
  unitName: yup
    .string()
    .transform((value) => value || null)
    .nullable(),
  linkUrl: yup.string().when('status', {
    is: MaterialStatus.NotReadyToOrder,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.required('URL is required!').url('Invalid URL')
  }),
  notes: yup
    .string()
    .transform((value) => value || null)
    .nullable(),
  pdmFileName: yup
    .string()
    .transform((value) => value || null)
    .nullable(),
  assemblyId: yup
    .string()
    .transform((value) => value || null)
    .nullable()
}) as yup.ObjectSchema<MaterialFormInput>;

export interface MaterialFormInput {
  name: string;
  status: MaterialStatus;
  materialTypeName: string | null;
  manufacturerName: string | null;
  manufacturerPartNumber: string | null;
  pdmFileName: string | null;
  quantity: number;
  price: number;
  unitName: string | null;
  linkUrl: string;
  notes: string | null;
  assemblyId: string | null;
}

export interface MaterialDataSubmission {
  name: string;
  status: MaterialStatus;
  materialTypeName?: string;
  manufacturerName?: string;
  manufacturerPartNumber?: string;
  pdmFileName?: string;
  price: number;
  quantity: Decimal;
  unitName?: string;
  linkUrl?: string;
  notes?: string;
  assemblyId?: string;
  subtotal: number;
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
      name: defaultValues?.name,
      status: defaultValues?.status ?? MaterialStatus.NotReadyToOrder,
      materialTypeName: defaultValues?.materialTypeName,
      manufacturerPartNumber: defaultValues?.manufacturerPartNumber,
      quantity: defaultValues?.quantity ?? 0,
      manufacturerName: defaultValues?.manufacturerName,
      pdmFileName: defaultValues?.pdmFileName,
      price: defaultValues?.price ?? 0,
      unitName: defaultValues?.unitName,
      linkUrl: defaultValues?.linkUrl,
      notes: defaultValues?.notes,
      assemblyId: defaultValues?.assemblyId
    },
    resolver: yupResolver(schema)
  });

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

    const submission: MaterialDataSubmission = {
      name: data.name,
      status: data.status,
      quantity: new Decimal(data.quantity),
      price,
      subtotal
    };

    if (data.status !== MaterialStatus.NotReadyToOrder) {
      submission.materialTypeName = data.materialTypeName || '';
      submission.manufacturerName = data.manufacturerName || '';
      submission.manufacturerPartNumber = data.manufacturerPartNumber || '';
      submission.linkUrl = data.linkUrl;
    }

    if (data.pdmFileName) submission.pdmFileName = data.pdmFileName;
    if (data.unitName) submission.unitName = data.unitName;
    if (data.notes) submission.notes = data.notes;
    if (data.assemblyId) submission.assemblyId = data.assemblyId;

    onSubmit(submission);
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
    />
  );
};

export default MaterialForm;
