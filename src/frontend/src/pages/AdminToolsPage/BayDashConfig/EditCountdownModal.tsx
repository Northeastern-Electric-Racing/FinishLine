/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useCallback } from 'react';
import { Box, FormControl, FormHelperText, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ErrorPage from '../../ErrorPage';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useEditBayDashboardCountdown } from '../../../hooks/bay-dashboard.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { BayDashboardCountdown, dbDateToLocalDate } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { DatePicker } from '@mui/x-date-pickers';

const schema = yup.object().shape({
  name: yup.string().trim().required('Name is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .nullable()
    .default(null)
    .test('is-after-start', 'End date must be after the start date', function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return new Date(value) > new Date(startDate);
    })
});

interface EditCountdownModalProps {
  showModal: boolean;
  handleClose: () => void;
  countdown: BayDashboardCountdown;
  slug: string;
}

const EditCountdownModal: React.FC<EditCountdownModalProps> = ({ showModal, handleClose, countdown, slug }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useEditBayDashboardCountdown(slug);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: countdown.name,
      startDate: dbDateToLocalDate(countdown.startDate),
      endDate: countdown.endDate ? dbDateToLocalDate(countdown.endDate) : null
    }
  });
  const handleReset = useCallback(() => {
    reset({
      name: countdown.name,
      startDate: dbDateToLocalDate(countdown.startDate),
      endDate: countdown.endDate ? dbDateToLocalDate(countdown.endDate) : null
    });
  }, [reset, countdown]);

  const onSubmit = async (data: { name: string; startDate: Date; endDate: Date | null }) => {
    try {
      await mutateAsync({
        countdownId: countdown.bayDashboardCountdownId,
        name: data.name,
        startDate: data.startDate,
        isPrimary: countdown.isPrimary,
        endDate: data.endDate ?? undefined
      });
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={() => {
        handleReset();
        handleClose();
      }}
      title="Edit Countdown"
      reset={handleReset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-countdown-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl fullWidth>
          <FormLabel>Countdown Name</FormLabel>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Start Date</FormLabel>
          <Controller
            name="startDate"
            control={control}
            render={({ field: { onChange, value } }) => <DatePicker value={value} onChange={onChange} />}
          />
          <FormHelperText error>{errors.startDate?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>End Date</FormLabel>
          <Controller
            name="endDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker value={value} onChange={onChange} slotProps={{ field: { clearable: true } }} />
            )}
          />
          <FormHelperText error>{errors.endDate?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};
export default EditCountdownModal;
