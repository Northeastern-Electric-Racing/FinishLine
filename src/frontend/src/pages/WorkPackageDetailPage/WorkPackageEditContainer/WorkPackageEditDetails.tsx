/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, WbsElementStatus, WorkPackageStage } from 'shared';
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
  const StatusSelect = (
    <FormControl>
      <FormLabel>Status</FormLabel>
      <Controller
        name="wbsElementStatus"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
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

  const StageSelect = () => (
    <Controller
      name="stage"
      control={control}
      render={({ field: { onChange, value } }) => (
        <TextField select onChange={onChange} value={value} label="Stage" fullWidth>
          <MenuItem value={'NONE'}>NONE</MenuItem>
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
      <Grid container xs={12}>
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormControl sx={{ width: '90%' }}>
            <FormLabel>Work Package Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter work package name..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={'auto'} sx={{ mt: 1 }}>
          <FormControl sx={{ width: '90%' }}>
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
        <Grid item xs={12} md={3} sx={{ mt: 1 }}>
          <StatusSelect />
        </Grid>
        <Grid container sx={{ my: 1 }}>
          <Grid item xs={6}>
            <FormControl sx={{ width: '90%' }}>
              <FormLabel>Project Lead</FormLabel>
              <Controller
                name="projectLead"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <>
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
          <Grid item xs={6}>
            <FormControl sx={{ width: '90%' }}>
              <FormLabel>Project Manager</FormLabel>
              <Controller
                name="projectManager"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <>
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
        </Grid>
        <Grid item xs={12} md={6} sx={{ my: 1 }}>
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
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <StageSelect />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
