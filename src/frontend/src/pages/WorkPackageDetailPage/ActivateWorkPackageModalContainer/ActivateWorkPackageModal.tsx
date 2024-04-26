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
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, FormLabel, FormControl } from '@mui/material';
import { RadioGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Radio } from '@mui/material';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { startDateTester } from '../../../utils/form';

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
  confirmDetails: yup.boolean().required()
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
    startDate: startDate,
    confirmDetails: false
  };

  const { reset, handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const [projectLeadId, setProjectLeadId] = useState<string>();
  const [projectManagerId, setProjectManagerId] = useState<string>();
  const toast = useToast();
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    const { startDate, confirmDetails } = data;
    if (!projectLeadId) {
      toast.error('Please Select a Project Lead');
      return;
    }
    if (!projectManagerId) {
      toast.error('Please Select a Project Manager');
      return;
    }
    await onSubmit({
      startDate,
      confirmDetails,
      projectLeadId: parseInt(projectLeadId),
      projectManagerId: parseInt(projectManagerId)
    });
    reset(defaultValues);
  };

  const isStartDateDisabled = (startDate: Date) => {
    return startDate.getDay() !== 1;
  };

  return (
    <form id={'activate-work-package-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
      <Dialog open={modalShow} onClose={onHide}>
        <DialogTitle>{`Activate #${wbsPipe(wbsNum)}`}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <NERAutocomplete
                id="project-lead-autocomplete"
                onChange={(_event, value) => setProjectLeadId(value?.id)}
                options={allUsers.map((p) => ({
                  label: fullNamePipe(p),
                  id: p.userId.toString()
                }))}
                size="small"
                placeholder="Project Lead"
                listboxProps={{ style: { maxHeight: '199px' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <NERAutocomplete
                id="project-manager-autocomplete"
                onChange={(_event, value) => setProjectManagerId(value?.id)}
                options={allUsers.map((p) => ({
                  label: fullNamePipe(p),
                  id: p.userId.toString()
                }))}
                size="small"
                placeholder="Project Manager"
                listboxProps={{ style: { maxHeight: '199px' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <DatePicker
                        format="yyyy-MM-dd"
                        onChange={(date) => onChange(date ?? new Date())}
                        className={'padding: 10'}
                        value={value}
                        shouldDisableDate={isStartDateDisabled}
                        slotProps={{ textField: { autoComplete: 'off' } }}
                      />
                    </>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Are the WP details correct?</FormLabel>
                <Controller
                  name="confirmDetails"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <RadioGroup
                        value={value}
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        onChange={onChange}
                      >
                        <FormControlLabel value={1} control={<Radio />} label="Yes" />
                        <FormControlLabel value={0} control={<Radio />} label="No" />
                      </RadioGroup>
                    </>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Box textAlign="right" sx={{ my: 2 }}>
            <NERFailButton variant="outlined" form="activate-work-package-form" onClick={onHide} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" form="activate-work-package-form" sx={{ mx: 1 }}>
              Submit
            </NERSuccessButton>
          </Box>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default ActivateWorkPackageModal;
