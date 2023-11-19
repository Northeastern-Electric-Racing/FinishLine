import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { MaterialStatus, WbsElement } from 'shared';
import * as yup from 'yup';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  useAssembliesByWbsNum,
  useGetAllManufacturers,
  useGetAllMaterialTypes,
  useGetAllUnits
} from '../../../hooks/bom.hooks';
import MaterialFormView from './MaterialFormView';

const schema = yup.object().shape({
  name: yup.string().required(),
  status: yup.string().required(),
  typeName: yup.string().required(),
  manufactuerPartNumber: yup.number().required(),
  nerPN: yup.number().required(),
  quantity: yup.number().required(),
  price: yup.number().required(),
  unitName: yup.string().required(),
  link: yup.string().required(),
  notes: yup.string().required()
});

export interface MaterialFormInput {
  name: string;
  status: MaterialStatus;
  materialTypeName: string;
  manufacturerName: string;
  manufacturerPartNumber: string;
  nerPartNumber?: string;
  price: number;
  quantity: number;
  unitName?: string;
  linkUrl: string;
  notes: string;
  assemblyId?: string;
}

export interface MaterialFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: MaterialFormInput) => void;
  defaultValues?: MaterialFormInput;
  wbsElement: WbsElement;
  onHide: () => void;
  open: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ submitText, onSubmit, defaultValues, wbsElement, onHide, open }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<MaterialFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      status: defaultValues?.status ?? ('UNORDERED' as MaterialStatus),
      materialTypeName: defaultValues?.materialTypeName ?? '',
      manufacturerPartNumber: defaultValues?.manufacturerPartNumber ?? '',
      quantity: defaultValues?.quantity ?? 0,
      manufacturerName: defaultValues?.manufacturerName ?? '',
      nerPartNumber: defaultValues?.nerPartNumber ?? '',
      price: defaultValues?.price ?? 0,
      unitName: defaultValues?.unitName ?? '',
      linkUrl: defaultValues?.linkUrl ?? '',
      notes: defaultValues?.notes ?? '',
      assemblyId: defaultValues?.assemblyId ?? ''
    },
    resolver: yupResolver(schema)
  });

  const { data: materialTypes, isLoading: isLoadingMaterialTypes } = useGetAllMaterialTypes();

  const { data: units, isLoading: isLoadingUnits } = useGetAllUnits();

  const { data: manufactuers, isLoading: isLoadingManufactuers } = useGetAllManufacturers();

  const { data: assemblies, isLoading: isLoadingAssemblies } = useAssembliesByWbsNum(wbsElement.wbsNum);

  if (
    isLoadingManufactuers ||
    isLoadingMaterialTypes ||
    isLoadingUnits ||
    isLoadingAssemblies ||
    !materialTypes ||
    !units ||
    !manufactuers ||
    !assemblies
  ) {
    return <LoadingIndicator />;
  }

  return (
    <MaterialFormView
      assemblies={assemblies}
      allManufacturers={manufactuers}
      allMaterialTypes={materialTypes}
      allUnits={units}
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      open={open}
    />
  );
};

export default MaterialForm;
