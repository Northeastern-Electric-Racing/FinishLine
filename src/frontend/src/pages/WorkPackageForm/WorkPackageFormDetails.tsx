/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WorkPackageStage } from 'shared';
import { FormControl, FormLabel, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrorsImpl } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { Box } from '@mui/system';
import ChangeRequestDropdown from '../../components/ChangeRequestDropdown';
import NERAutocomplete from '../../components/NERAutocomplete';
import ReactHookTextField from '../../components/ReactHookTextField';
import { fullNamePipe } from '../../utils/pipes';
import { WorkPackageFormViewPayload } from './WorkPackageFormView';

interface Props {
  lead?: string;
  manager?: string;
  setManager: (manager?: string) => void;
  setLead: (lead?: string) => void;
  usersForLead: User[];
  usersForManager: User[];
  control: Control<WorkPackageFormViewPayload>;
  errors: Partial<FieldErrorsImpl<WorkPackageFormViewPayload>>;
  createForm?: boolean;
  endDate: Date;
}

const WorkPackageFormDetails: React.FC<Props> = ({
  lead,
  manager,
  setManager,
  setLead,
  usersForLead,
  usersForManager,
  control,
  errors,
  createForm = false,
  endDate
}) => {
  const userToOption = (user?: User): { label: string; id: string } => {
    if (!user) return { label: '', id: '' };
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  const disableStartDate = (startDate: Date) => {
    return startDate.getDay() !== 1;
  };

  const StageSelect = () => (
    <FormControl fullWidth>
      <FormLabel>Work Package Stage</FormLabel>
      <Controller
        name="stage"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField select onChange={onChange} value={value} fullWidth>
            <MenuItem value={'NONE'}>NONE</MenuItem>
            {Object.values(WorkPackageStage).map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </FormControl>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ marginBottom: '10px', color: 'white' }}>
        Details
      </Typography>
      <Grid container rowSpacing={2} spacing={1} xs={12}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Work Package Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter work package name..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <StageSelect />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChangeRequestDropdown control={control} name="crId" errors={errors} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth sx={{ overflow: 'hidden' }}>
            <FormLabel sx={{ whiteSpace: 'noWrap' }}>Start Date (YYYY-MM-DD)</FormLabel>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DatePicker
                    format="MM/dd/yyyy"
                    onChange={(date) => onChange(date ?? new Date())}
                    className={'padding: 10'}
                    value={value}
                    shouldDisableDate={disableStartDate}
                    slotProps={{
                      textField: { autoComplete: 'off', error: !!errors.startDate, helperText: errors.startDate?.message }
                    }}
                  />
                </>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>Duration</FormLabel>
            <ReactHookTextField
              name="duration"
              control={control}
              type="number"
              placeholder="Enter duration..."
              errorMessage={errors.duration}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth sx={{ overflow: 'hidden' }}>
            <FormLabel sx={{ whiteSpace: 'noWrap' }}>Calculated End Date (YYYY-MM-DD)</FormLabel>
            <TextField value={endDate.toLocaleDateString()} disabled />
          </FormControl>
        </Grid>
        {!createForm && (
          <>
            <Grid item xs={12} md={6}>
              <FormLabel> Project Lead</FormLabel>
              <NERAutocomplete
                sx={{ width: '100%' }}
                id="lead-autocomplete"
                onChange={(_event, value) => setLead(value?.id)}
                options={usersForLead.map(userToOption)}
                size="small"
                placeholder="Select a Project Lead"
                value={userToOption(usersForLead.find((user) => user.userId.toString() === lead))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormLabel>Project Manager</FormLabel>
              <NERAutocomplete
                sx={{ width: '100%' }}
                id="manager-autocomplete"
                onChange={(_event, value) => setManager(value?.id)}
                options={usersForManager.map(userToOption)}
                size="small"
                placeholder="Select a Project Manager"
                value={userToOption(usersForManager.find((user) => user.userId.toString() === manager))}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default WorkPackageFormDetails;
