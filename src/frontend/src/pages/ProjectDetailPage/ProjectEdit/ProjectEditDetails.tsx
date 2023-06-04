import { User } from 'shared';
import { Controller, Control, FieldErrorsImpl } from 'react-hook-form';
import { FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/pipes';
import { ProjectEditFormInput } from './ProjectEditContainer';

interface ProjectEditDetailsProps {
  users: User[];
  control: Control<ProjectEditFormInput>;
  errors: FieldErrorsImpl<ProjectEditFormInput>;
}

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({ users, control, errors }) => {
  return (
    <PageBlock title="Project Details">
      <Grid container xs={12} sx={{ my: 1 }}>
        <Grid item xs={8}>
          <FormControl>
            <FormLabel>Project Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter project name..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl>
            <FormLabel>Budget</FormLabel>
            <ReactHookTextField
              name="budget"
              control={control}
              type="number"
              placeholder="Enter budget..."
              icon={<AttachMoneyIcon />}
              errorMessage={errors.budget}
            />
          </FormControl>
        </Grid>
        <Grid item sx={{ my: 1 }}>
          <FormControl>
            <FormLabel>Project Lead</FormLabel>
            <Controller
              name="projectLeadId"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TextField select onChange={onChange} value={value} sx={{ mr: 4, minWidth: '8%' }}>
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
        <Grid item sx={{ my: 1 }}>
          <FormControl>
            <FormLabel>Project Manager</FormLabel>
            <Controller
              name="projectManagerId"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TextField select onChange={onChange} value={value} sx={{ minWidth: '8%' }}>
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
        {}
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
