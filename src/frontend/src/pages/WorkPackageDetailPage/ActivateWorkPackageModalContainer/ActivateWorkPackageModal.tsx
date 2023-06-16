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
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  FormLabel,
  FormControl
} from '@mui/material';
import { RadioGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Radio } from '@mui/material';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';

interface ActivateWorkPackageModalProps {
  allUsers: User[];
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  startDate: yup.date().required(),
  confirmDetails: yup.boolean().required()
});

const defaultValues: FormInput = {
  startDate: new Date().toLocaleDateString(),
  confirmDetails: false
};

const ActivateWorkPackageModal: React.FC<ActivateWorkPackageModalProps> = ({
  allUsers,
  wbsNum,
  modalShow,
  onHide,
  onSubmit
}) => {
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
                        inputFormat="yyyy-MM-dd"
                        onChange={onChange}
                        className={'padding: 10'}
                        value={value}
                        renderInput={(params) => <TextField autoComplete="off" {...params} />}
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
