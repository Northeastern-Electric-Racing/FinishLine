/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { User, WbsNumber } from 'shared';
import { FormInput } from './ActivateWorkPackageModalContainer';
import { fullNamePipe, wbsPipe } from '../../../utils/pipes';
import { Grid, FormLabel, FormControl } from '@mui/material';
import { RadioGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Radio } from '@mui/material';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { startDateTester } from '../../../utils/form';
import NERFormModal from '../../../components/NERFormModal';

interface ActivateWorkPackageModalProps {
  allUsers: User[];
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  startDate: yup
    .date()
    .required('Start Date is required')
    .test('start-date-valid', 'start date is not valid', startDateTester),
  confirmDetails: yup
    .boolean()
    .required('Please confirm project details are correct')
    .test('is-true', 'Please confirm', (value) => value === true)
});

const ActivateWorkPackageModal: React.FC<ActivateWorkPackageModalProps> = ({
  allUsers,
  wbsNum,
  modalShow,
  onHide,
  onSubmit
}) => {
  const startDate = new Date();
  const today = startDate.getDay();
  if (today !== 1) {
    const daysUntilNextMonday = (7 - today + 1) % 7;
    startDate.setDate(startDate.getDate() + daysUntilNextMonday);
  }

  const defaultValues: FormInput = {
    startDate,
    confirmDetails: false
  };

  const {
    reset,
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate,
      confirmDetails: false
    },
    mode: 'onChange'
  });

  const [leadId, setLeadId] = useState<string>();
  const [managerId, setManagerId] = useState<string>();
  const toast = useToast();
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    const { startDate, confirmDetails } = data;
    if (!leadId) {
      toast.error('Please Select a Project Lead');
      return;
    }
    if (!managerId) {
      toast.error('Please Select a Project Manager');
      return;
    }
    await onSubmit({
      startDate,
      confirmDetails,
      leadId,
      managerId
    });
    reset(defaultValues);
  };

  const isStartDateDisabled = (startDate: Date) => {
    return startDate.getDay() !== 1;
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Activate #${wbsPipe(wbsNum)}`}
      reset={() => reset(defaultValues)}
      submitText="Submit"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmitWrapper}
      formId="activate-work-package-form"
      showCloseButton
      disabled={!isValid}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <NERAutocomplete
            id="project-lead-autocomplete"
            onChange={(_event, value) => setLeadId(value?.id)}
            options={allUsers.map((p) => ({
              label: fullNamePipe(p),
              id: p.userId.toString()
            }))}
            size="small"
            placeholder="Project Lead"
            listboxProps={{ style: { maxHeight: '150px' } }}
          />
        </Grid>
        <Grid item xs={6}>
          <NERAutocomplete
            id="project-manager-autocomplete"
            onChange={(_event, value) => setManagerId(value?.id)}
            options={allUsers.map((p) => ({
              label: fullNamePipe(p),
              id: p.userId.toString()
            }))}
            size="small"
            placeholder="Project Manager"
            listboxProps={{ style: { maxHeight: '150px' } }}
          />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
          <Controller
            name="startDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                format="yyyy-MM-dd"
                onChange={(date) => onChange(date ?? new Date())}
                className={'padding: 10'}
                value={value}
                shouldDisableDate={isStartDateDisabled}
                slotProps={{ textField: { autoComplete: 'off' } }}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Are the WP details correct?</FormLabel>
            <Controller
              name="confirmDetails"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  value={value}
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  onChange={onChange}
                >
                  <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  <FormControlLabel value={false} control={<Radio />} label="No" />
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default ActivateWorkPackageModal;
