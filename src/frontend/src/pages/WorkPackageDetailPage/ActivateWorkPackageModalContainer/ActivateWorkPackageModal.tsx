/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormLabel } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { User, WbsNumber } from 'shared';
import { FormInput } from './ActivateWorkPackageModalContainer';
import { fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/material';
import { Select, SelectChangeEvent } from '@mui/material';
import { MenuItem } from '@mui/material';
import { OutlinedInput } from '@mui/material';
import { InputLabel } from '@mui/material';
import { RadioGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Radio } from '@mui/material';
import { useState } from 'react';

interface ActivateWorkPackageModalProps {
  allUsers: User[];
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  projectLeadId: yup.number().required().min(0),
  projectManagerId: yup.number().required().min(0),
  startDate: yup.string().required(),
  confirmDetails: yup.boolean().required()
});

const ActivateWorkPackageModal: React.FC<ActivateWorkPackageModalProps> = ({
  allUsers,
  wbsNum,
  modalShow,
  onHide,
  onSubmit
}) => {
  const { register, reset, handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ projectLeadId: -1, projectManagerId: -1, startDate: '', confirmDetails: false });
  };

  const [projectLead, setProjectLead] = useState('');
  const [projectManager, setProjectManager] = useState('');

  const handleLeadChange = (event: SelectChangeEvent) => {
    setProjectLead(event.target.value);
  };

  const handleManagerChange = (event: SelectChangeEvent) => {
    setProjectManager(event.target.value);
  };

  return (
    <form id={'activate-work-package-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
      <Dialog open={modalShow} onClose={onHide}>
        <DialogTitle>{`Activate #${wbsPipe(wbsNum)}`}</DialogTitle>
        <DialogContent>
          <div className={'px-4'}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>Start Date (YYYY-MM-DD)</Typography>
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
            <Controller
              name="projectLeadId"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>Project Lead</Typography>
                  <Select onChange={handleLeadChange} value={projectLead} variant="outlined" size="small" fullWidth>
                    {allUsers.map((p) => (
                      <MenuItem key={p.userId} value={p.userId}>
                        {fullNamePipe(p)}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            />

            <Controller
              name="projectManagerId"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>Project Manager</Typography>
                  <Select onChange={handleManagerChange} value={projectManager} variant="outlined" size="small" fullWidth>
                    {allUsers.map((p) => (
                      <MenuItem key={p.userId} value={p.userId}>
                        {fullNamePipe(p)}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            />

            <Controller
              name="confirmDetails"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>Are the WP details correct?</Typography>
                  <RadioGroup
                    value={value}
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                  >
                    <FormControlLabel value={1} control={<Radio />} label="Yes" />
                    <FormControlLabel value={0} control={<Radio />} label="No" />
                  </RadioGroup>
                </>
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" form="activate-work-package-form" onClick={onHide}>
            Cancel
          </Button>
          <Button color="success" variant="contained" type="submit" form="activate-work-package-form">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default ActivateWorkPackageModal;
