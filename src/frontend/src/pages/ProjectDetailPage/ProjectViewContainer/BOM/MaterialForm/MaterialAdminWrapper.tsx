import { Control, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialType, Unit } from 'shared';
import { MaterialFormInput } from './MaterialForm';
import React from 'react';
import { useAllReimbursementRequests } from '../../../../../hooks/finance.hooks';
import ErrorPage from '../../../../ErrorPage';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import MaterialFormView from './MaterialFormView';

export interface MaterialAdminWrapperProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<MaterialFormInput>;
  onSubmit: (payload: MaterialFormInput) => void;
  onHide: () => void;
  control: Control<MaterialFormInput, any>;
  errors: FieldErrors<MaterialFormInput>;
  allMaterialTypes: MaterialType[];
  allUnits: Unit[];
  allManufacturers: Manufacturer[];
  assemblies: Assembly[];
  open: boolean;
  watch: UseFormWatch<MaterialFormInput>;
  createManufacturer: (name: string) => void;
  setValue: UseFormSetValue<MaterialFormInput>;
}

const MaterialAdminWrapper: React.FC<MaterialAdminWrapperProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allMaterialTypes,
  allUnits,
  allManufacturers,
  assemblies,
  open,
  watch,
  createManufacturer,
  setValue
}) => {
  const {
    data: reimbursementRequests,
    isLoading: isLoadingRRs,
    isError: rrIsError,
    error: rrError
  } = useAllReimbursementRequests();

  if (rrIsError) return <ErrorPage message={rrError.message} />;
  if (!reimbursementRequests || isLoadingRRs) return <LoadingIndicator />;

  return (
    <MaterialFormView
      assemblies={assemblies}
      allManufacturers={allManufacturers}
      allMaterialTypes={allMaterialTypes}
      allUnits={allUnits}
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
    />
  );
};

export default MaterialAdminWrapper;
