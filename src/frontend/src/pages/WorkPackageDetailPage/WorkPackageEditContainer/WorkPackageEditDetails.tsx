/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WbsElementStatus, WorkPackageStage } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';
import PageBlock from '../../../layouts/PageBlock';
import { Grid, MenuItem, TextField } from '@mui/material';
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
        <TextField select onChange={onChange} value={value} label="Status" fullWidth>
          {statuses.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );

  const stageSelect = (
    <Controller
      name="stage"
      control={control}
      render={({ field: { onChange, value } }) => (
        <TextField select onChange={onChange} value={value} label="Stage" fullWidth>
          <MenuItem value={''}>None</MenuItem>
          {Object.values(WorkPackageStage).map((stage) => (
            <MenuItem key={stage} value={stage}>
              {stage}
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
          <ReactHookTextField name="name" control={control} fullWidth label="Work Package Name" errorMessage={errors.name} />
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
          {statusSelect}
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
            errorMessage={errors.budget}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          {stageSelect}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
