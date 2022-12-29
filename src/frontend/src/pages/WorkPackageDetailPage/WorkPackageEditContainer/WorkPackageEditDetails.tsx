/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WbsElementStatus } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';
import PageBlock from '../../../layouts/PageBlock';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
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
    <Controller
      name="wbsElementStatus"
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <TextField select onChange={onChange} value={value} label="Status">
          {statuses.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );

  return (
    <PageBlock title="Work Package Details">
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <ReactHookTextField
            name="name"
            control={control}
            sx={{ width: 10 / 10 }}
            label="Work Package Name"
            errorMessage={errors.name}
          />
        </Grid>
        <Grid item xs={12} md={2} sx={{ mt: 2, mb: 1 }}>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <DatePicker
                  label={'Start Date (YYYY-MM-DD)'}
                  inputFormat="yyyy-MM-dd"
                  onChange={onChange}
                  className={'padding: 10'}
                  value={value}
                  renderInput={(params) => <TextField autoComplete="off" {...params} />}
                />
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ mt: 2, mb: 1 }}>
          <Typography>{statusSelect}</Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <Controller
            name="projectLead"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextField select onChange={onChange} value={value} label="Project Lead" fullWidth>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <Controller
            name="projectManager"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextField select onChange={onChange} value={value} label="Project Manager" fullWidth>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <ReactHookTextField
            name="duration"
            control={control}
            type="number"
            label="Duration"
            sx={{ width: 3 / 10 }}
            errorMessage={errors.budget}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
