import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { MaterialStatus, WbsElement } from 'shared';
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

const schema = yup.object().shape({
  name: yup.string().required('Enter a name!'),
  status: yup.string().required('Select a status!'),
  materialTypeName: yup.string().required('Select a Material Type!'),
  manufacturerName: yup.string().required('Select a Manufacturer'),
  manufacturerPartNumber: yup.string().required('Manufacturer Part Number is required!'),
  quantity: yup.number().required('Enter a quantity!'),
  price: yup.number().required('Price per Unit is required!'),
  unitName: yup.string().optional(),
  linkUrl: yup.string().required('URL is required!').url('Invalid URL'),
  notes: yup.string().optional()
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
}

export interface MaterialFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: MaterialDataSubmission) => void;
  defaultValues?: MaterialFormInput;
  wbsElement: WbsElement;
  onHide: () => void;
  open: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ submitText, onSubmit, defaultValues, wbsElement, onHide, open }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm<MaterialFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      status: defaultValues?.status ?? ('UNORDERED' as MaterialStatus),
      materialTypeName: defaultValues?.materialTypeName ?? '',
      manufacturerPartNumber: defaultValues?.manufacturerPartNumber ?? '',
      quantity: defaultValues?.quantity ?? 0,
      manufacturerName: defaultValues?.manufacturerName ?? '',
      pdmFileName: defaultValues?.pdmFileName,
      price: defaultValues?.price ?? 0,
      unitName: defaultValues?.unitName,
      linkUrl: defaultValues?.linkUrl ?? '',
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

  const { assemblies } = wbsElement;

  if (materialTypesIsError) return <ErrorPage message={materialTypesError?.message} />;
  if (unitsIsError) return <ErrorPage message={unitsError?.message} />;
  if (manufacturersIsError) return <ErrorPage message={manufacturersError?.message} />;
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
    onSubmit({ ...data, subtotal: subtotal, price: price, quantity: new Decimal(data.quantity) });
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
