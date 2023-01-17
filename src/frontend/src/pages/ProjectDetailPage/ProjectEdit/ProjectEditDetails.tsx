import { User } from 'shared';
import { Controller } from 'react-hook-form';
import { Grid, MenuItem, TextField } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/pipes';

interface ProjectEditDetailsProps {
  users: User[];
  control: any;
  errors: any;
}

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({ users, control, errors }) => {
  return (
    <PageBlock title="Project Details">
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <ReactHookTextField
            name="name"
            control={control}
            sx={{ width: 10 / 10 }}
            label="Project Name"
            errorMessage={errors.name}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <ReactHookTextField
            name="budget"
            control={control}
            type="number"
            label="Budget"
            sx={{ width: 3 / 10 }}
            icon={<AttachMoneyIcon />}
            errorMessage={errors.budget}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="projectLeadId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextField select onChange={onChange} value={value} label="Project Lead" sx={{ mr: 4, my: 1, minWidth: '8%' }}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="projectManagerId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextField select onChange={onChange} value={value} label="Project Manager" sx={{ my: 1, minWidth: '8%' }}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <ReactHookTextField
            name="slideDeckLink"
            control={control}
            sx={{ width: '50%' }}
            label="Slide Deck Link"
            errorMessage={errors.slideDeckLink}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <ReactHookTextField
            name="googleDriveFolderLink"
            control={control}
            sx={{ width: '50%' }}
            label="Google Drive Folder Link"
            errorMessage={errors.googleDriveFolderLink}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <ReactHookTextField
            name="bomLink"
            control={control}
            sx={{ width: '50%' }}
            label="Bom Link"
            errorMessage={errors.bomLink}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <ReactHookTextField
            name="taskListLink"
            control={control}
            sx={{ width: '50%' }}
            label="Task List Link"
            errorMessage={errors.taskListLink}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
