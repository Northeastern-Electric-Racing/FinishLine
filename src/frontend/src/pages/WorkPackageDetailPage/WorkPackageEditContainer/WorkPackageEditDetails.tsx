/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WorkPackageStage } from 'shared';
import { Dispatch, SetStateAction } from 'react';
import { fullNamePipe } from '../../../utils/pipes';
import PageBlock from '../../../layouts/PageBlock';
import { FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import NERAutocomplete from '../../../components/NERAutocomplete';

interface Props {
  lead: string | undefined;
  manager: string | undefined;
  setManager: Dispatch<SetStateAction<string | undefined>>;
  setLead: Dispatch<SetStateAction<string | undefined>>;
  usersForProjectLead: User[];
  usersForProjectManager: User[];
  control: any;
  errors: any;
}

const WorkPackageEditDetails: React.FC<Props> = ({
  lead,
  manager,
  setManager,
  setLead,
  usersForProjectLead,
  usersForProjectManager,
  control,
  errors
}) => {
  const userToOption = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  const disableStartDate = (startDate: Date) => {
    return startDate.getDay() !== 1;
  };

  const StageSelect = () => (
    <FormControl fullWidth>
      <FormLabel>Stage Select</FormLabel>
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
    <PageBlock title="Work Package Details">
      <Grid container xs={12}>
        <Grid item xs={12} md={5} sx={{ mt: 2, mr: 2 }}>
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
        <Grid item xs={12} md={2} sx={{ mt: 2, mr: 2 }}>
          <FormControl fullWidth sx={{ overflow: 'hidden' }}>
            <FormLabel sx={{ whiteSpace: 'noWrap' }}>Start Date (YYYY-MM-DD)</FormLabel>
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
                    shouldDisableDate={disableStartDate}
                    renderInput={(params) => <TextField autoComplete="off" {...params} />}
                  />
                </>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2} sx={{ mt: 2, mr: 2 }}>
          <StageSelect />
        </Grid>
        <Grid item xs={12} md={2} sx={{ mt: 2, mr: 2 }}>
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
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel> Project Lead</FormLabel>
          <NERAutocomplete
            sx={{ mt: 1, width: '90%' }}
            id="project-lead-autocomplete"
            onChange={(_event, value) => setLead(value?.id)}
            options={usersForProjectLead.map(userToOption)}
            size="small"
            placeholder="Select a Project Lead"
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel>Project Manager</FormLabel>
          <NERAutocomplete
            sx={{ mt: 1, width: '90%' }}
            id="project-manager-autocomplete"
            onChange={(_event, value) => setManager(value?.id)}
            options={usersForProjectManager.map(userToOption)}
            size="small"
            placeholder="Select a Project Manager"
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
