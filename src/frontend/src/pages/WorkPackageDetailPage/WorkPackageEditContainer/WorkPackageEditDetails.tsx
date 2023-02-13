/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WbsElementStatus } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';
import PageBlock from '../../../layouts/PageBlock';
import { FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';

interface Props {
  users: User[];
  control: any;
  errors: any;
}

const statuses = Object.values(WbsElementStatus);

const WorkPackageEditDetails: React.FC<Props> = ({ users, control, errors }) => {
  const statusSelect = (
    <FormControl>
      <Controller
        name="wbsElementStatus"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <FormLabel>Status</FormLabel>
            <TextField select onChange={onChange} value={value}>
              {statuses.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
      />
    </FormControl>
  );

  return (
    <PageBlock title="Work Package Details">
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <FormControl>
            <FormLabel>Work Package Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              sx={{ width: '140%' }}
              placeholder="Enter work package name..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2} sx={{ mt: 2, mb: 1 }}>
          <FormControl>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
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
        <Grid item xs={12} md={4} sx={{ mt: 2, mb: 1 }}>
          {statusSelect}
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <FormControl>
            <Controller
              name="projectLead"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FormLabel>Project Lead</FormLabel>
                  <TextField select onChange={onChange} value={value} fullWidth>
                    {users.map((t) => (
                      <MenuItem key={t.userId} value={t.userId}>
                        {fullNamePipe(t)}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <FormControl>
            <Controller
              name="projectManager"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FormLabel>Project Manager</FormLabel>
                  <TextField select onChange={onChange} value={value} fullWidth>
                    {users.map((t) => (
                      <MenuItem key={t.userId} value={t.userId}>
                        {fullNamePipe(t)}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <FormControl>
            <FormLabel>Duration</FormLabel>
            <ReactHookTextField
              name="duration"
              control={control}
              type="number"
              placeholder="Enter duration..."
              sx={{ width: '140%' }}
              errorMessage={errors.budget}
            />
          </FormControl>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
