import { Control, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialType, Unit } from 'shared';
import { MaterialFormInput } from './MaterialForm';
import React from 'react';
import { useCurrentUsersTeamsReimbursementRequests } from '../../../../../hooks/finance.hooks';
import ErrorPage from '../../../../ErrorPage';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import MaterialFormView from './MaterialFormView';

export interface MaterialHeadWrapperProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<MaterialFormInput>;
  onSubmit: (payload: MaterialFormInput) => void;
  onHide: () => void;
  control: Control<MaterialFormInput, any>;
  errors: FieldErrors<MaterialFormInput>;
  allMaterialTypes: MaterialType[];
  allUnits: Unit[];
  allManufacturers: Manufacturer[];
  manufacturersLoading?: boolean;
  materialTypesLoading?: boolean;
  unitsLoading?: boolean;
  assemblies: Assembly[];
  assembliesLoading?: boolean;
  open: boolean;
  watch: UseFormWatch<MaterialFormInput>;
  createManufacturer: (name: string) => void;
  setValue: UseFormSetValue<MaterialFormInput>;
  fromRRForm?: boolean;
}

const MaterialHeadWrapper: React.FC<MaterialHeadWrapperProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allMaterialTypes,
  materialTypesLoading,
  allUnits,
  unitsLoading,
  allManufacturers,
  manufacturersLoading,
  assemblies,
  assembliesLoading,
  open,
  watch,
  createManufacturer,
  setValue,
  fromRRForm = false
}) => {
  const {
    data: reimbursementRequests,
    isLoading: isLoadingRRs,
    isError: rrIsError,
    error: rrError
  } = useCurrentUsersTeamsReimbursementRequests();

  if (rrIsError) return <ErrorPage message={rrError.message} />;
  if (!reimbursementRequests || isLoadingRRs) return <LoadingIndicator />;

  return (
    <MaterialFormView
      assemblies={assemblies}
      assembliesLoading={assembliesLoading}
      allManufacturers={allManufacturers}
      manufacturersLoading={manufacturersLoading}
      allMaterialTypes={allMaterialTypes}
      materialTypesLoading={materialTypesLoading}
      allUnits={allUnits}
      unitsLoading={unitsLoading}
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      reimbursementRequests={reimbursementRequests}
      open={open}
      watch={watch}
      createManufacturer={createManufacturer}
      setValue={setValue}
      fromRRForm={fromRRForm}
    />
  );
};

export default MaterialHeadWrapper;
