/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { BayDashboardCountdownCreateArgs } from 'shared';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';

interface CountdownFormValues {
  name: string;
  startDate: Date;
  endDate?: Date | null;
  isPrimary: boolean;
}

interface CountdownFormModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (countdown: BayDashboardCountdownCreateArgs) => Promise<unknown>;
}

const schema = yup.object().shape({
  name: yup.string().trim().required('Name is required'),
  startDate: yup.date().typeError('Start date is required').required('Start date is required'),
  endDate: yup
    .date()
    .nullable()
    .typeError('End date must be a valid date')
    .test('after-start', 'End date must be after the start date', (endDate, { parent }) => {
      if (!endDate || !parent.startDate) return true;
      return endDate > parent.startDate;
    }),
  isPrimary: yup.boolean().required()
});

const emptyValues = (): CountdownFormValues => ({ name: '', startDate: new Date(), endDate: null, isPrimary: false });

/**
 * Modal for entering a bay dashboard countdown's name, start date, optional end date, and whether it's the primary countdown
 */
const CountdownFormModal: React.FC<CountdownFormModalProps> = ({ open, handleClose, onSubmit }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CountdownFormValues>({
    resolver: yupResolver(schema),
    defaultValues: emptyValues()
  });

  // errors thrown here are toasted by NERFormModal, and the modal stays open so the countdown can be fixed and resubmitted
  const onFormSubmit = async ({ name, startDate, endDate, isPrimary }: CountdownFormValues) => {
    await onSubmit({ name: name.trim(), startDate, endDate: endDate ?? undefined, isPrimary });
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title="New Countdown"
      reset={() => reset(emptyValues())}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="bay-dashboard-countdown-form"
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Countdown Name*</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} placeholder="e.g. FHE" />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Start Date*</FormLabel>
        <Controller
          name="startDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker value={value} onChange={onChange} slotProps={{ textField: { error: !!errors.startDate } }} />
          )}
        />
        <FormHelperText error>{errors.startDate?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>End Date</FormLabel>
        <Controller
          name="endDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              value={value ?? null}
              onChange={onChange}
              slotProps={{ textField: { error: !!errors.endDate }, field: { clearable: true } }}
            />
          )}
        />
        <FormHelperText error={!!errors.endDate}>
          {errors.endDate?.message ?? 'Leave empty to count up from the start date'}
        </FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Controller
          name="isPrimary"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              control={<Checkbox checked={value} onChange={(event) => onChange(event.target.checked)} />}
              label="Primary countdown"
            />
          )}
        />
        <FormHelperText>The primary countdown is the large one on the TV, and replaces the current primary</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CountdownFormModal;
