/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WorkPackageStage } from 'shared';
import { useState } from 'react';
import { fullNamePipe } from '../../../utils/pipes';
import PageBlock from '../../../layouts/PageBlock';
import { FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import NERAutocomplete from '../../../components/NERAutocomplete';

interface Props {
  users1: User[];
  users2: User[];
  control: any;
  errors: any;
}

const WorkPackageEditDetails: React.FC<Props> = ({ users1, users2, control, errors }) => {
  const [lead, setLead] = useState<User | null>(null);
  const [manager, setManager] = useState<User | null>(null);

  const usersSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const lead = users1.find((lead: User) => lead.userId.toString() === value.id);
      const manager = users2.find((manager: User) => manager.userId.toString() === value.id);

      if (lead) {
        setLead(lead);
      }

      if (manager) {
        setManager(manager);
      }
    } else {
      setLead(null);
      setManager(null);
    }
  };

  // const userToAutocompleteOption = (user: User): { label: string; id: string } => {
  //   return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  // };

  // const projectManagerOptions = users1.map((manager) => {
  //   return {
  //     label: `${fullNamePipe(manager)} (${manager.email}) - ${manager.role}`,
  //     id: manager.userId.toString()
  //   };
  // });

  // const projectLeadOptions = users2.map((lead) => {
  //   return {
  //     label: `${fullNamePipe(lead)} (${lead.email}) - ${lead.role}`,
  //     id: lead.userId.toString()
  //   };
  // });

  const projectLeadOptions = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  const projectManagerOptions = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
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
      <Grid container spacing={2}>
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
        <Grid item xs={12} md={2} sx={{ mt: 2, mr: 29 }}>
          <Grid item xs={12} md={8}>
            <FormLabel> Project Lead</FormLabel>
            <NERAutocomplete
              sx={{ mt: 1, width: '280%' }}
              id="users-autocomplete"
              onChange={usersSearchOnChange}
              options={users1.map(projectLeadOptions)}
              size="small"
              placeholder="Select a Project Lead"
              value={lead ? projectLeadOptions(lead) : null}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} md={2} sx={{ mt: 2, mr: 2 }}>
          <Grid item xs={12} md={8}>
            <FormLabel> Project Manager</FormLabel>
            <NERAutocomplete
              sx={{ mt: 1, width: '280%' }}
              id="users-autocomplete"
              onChange={usersSearchOnChange}
              options={users2.map(projectManagerOptions)}
              size="small"
              placeholder="Select a Project Manager"
              value={manager ? projectManagerOptions(manager) : null}
            />
          </Grid>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
