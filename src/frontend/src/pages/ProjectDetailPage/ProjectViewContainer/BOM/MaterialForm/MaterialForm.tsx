import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { MaterialStatus, WbsElement } from 'shared';
import * as yup from 'yup';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import {
  useCreateManufacturer,
  useCreateUnit,
  useGetAllManufacturers,
  useGetAllMaterialTypes,
  useGetAllUnits
} from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';
import MaterialFormView from './MaterialFormView';

const schema = yup.object().shape({
  name: yup.string().required('Enter a name!'),
  status: yup.string().required('Select a status!'),
  materialTypeName: yup.string().required('Select a Material Type!'),
  manufacturerName: yup.string().required('Select a Manufacturer'),
  manufacturerPartNumber: yup.string().required('Manufacturer Part Number is required!'),
  nerPartNumber: yup.string().optional(),
  quantity: yup.number().integer().required('Enter a quantity!'),
  price: yup.number().required('Price is required!'),
  unitName: yup.string().optional(),
  linkUrl: yup.string().required('URL is required!').url('Invalid URL'),
  notes: yup.string().required('Notes are required!')
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
  notes: string;
  assemblyId?: string;
}

export interface MaterialDataSubmission extends MaterialFormInput {
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
      pdmFileName: defaultValues?.pdmFileName ?? '',
      price: defaultValues?.price ?? 0,
      unitName: defaultValues?.unitName,
      linkUrl: defaultValues?.linkUrl ?? '',
      notes: defaultValues?.notes ?? '',
      assemblyId: defaultValues?.assemblyId
    },
    resolver: yupResolver(schema)
  });

  const { mutateAsync: createUnit, isLoading: isLoadingCreateUnit } = useCreateUnit();
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
    isLoadingCreateUnit ||
    isLoadingCreateManufacturer
  ) {
    return <LoadingIndicator />;
  }

  const onSubmitWrapper = (data: MaterialFormInput): void => {
    const price = Math.round(data.price * 100);
    const subtotal = data.unitName ? price : data.quantity * price;
    onSubmit({ ...data, subtotal: subtotal, price: price });
  };

  const createUnitWrapper = async (unitName: string): Promise<void> => {
    try {
      const createdUnit = await createUnit({ name: unitName });
      setValue('unitName', createdUnit.name);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
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
      createUnit={createUnitWrapper}
      createManufacturer={createManufacturerWrapper}
      setValue={setValue}
    />
  );
};

export default MaterialForm;
