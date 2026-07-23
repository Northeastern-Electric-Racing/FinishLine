/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useCallback } from 'react';
import { Box, FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERFormModal from '../../components/NERFormModal';
import { useToast } from '../../hooks/toasts.hooks';
import { useCreateDashboard } from '../../hooks/dashboards.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Name is required')
});

interface DashboardFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  /** The relative path (pathname + query string) whose filters this dashboard saves. */
  currentLink: string;
}

const DashboardFormModal: React.FC<DashboardFormModalProps> = ({ showModal, handleClose, currentLink }) => {
  const toast = useToast();
  const { mutateAsync } = useCreateDashboard();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '' }
  });

  const handleReset = useCallback(() => {
    reset({ name: '' });
  }, [reset]);

  const onSubmit = async (data: { name: string }) => {
    try {
      await mutateAsync({ name: data.name, link: currentLink });
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={() => {
        handleReset();
        handleClose();
      }}
      title="Save Dashboard"
      reset={handleReset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="dashboard-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl fullWidth>
          <FormLabel>Dashboard Name</FormLabel>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default DashboardFormModal;
