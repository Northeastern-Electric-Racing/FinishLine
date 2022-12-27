import { User, WbsElementStatus } from 'shared';
import { Controller } from 'react-hook-form';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/Pipes';

interface ProjectEditDetailsProps {
  users: User[];
  control: any;
  errors: any;
}

const statuses = Object.values(WbsElementStatus);

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({ users, control, errors }) => {
  return (
    <PageBlock title="Project Details">
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <Typography>
            <ReactHookTextField
              name="name"
              control={control}
              sx={{ width: 10 / 10 }}
              label="Project Name"
              errorMessage={errors.name}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2, mb: 1 }}>
          <Typography>
            <ReactHookTextField
              name="budget"
              control={control}
              type="number"
              label="Budget"
              sx={{ width: 3 / 10 }}
              icon={<AttachMoneyIcon />}
              errorMessage={errors.budget}
            />
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="wbsElementStatus"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Typography>
                <TextField select onChange={onChange} value={value} label="Status" sx={{ my: 1 }}>
                  {statuses.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Typography>
            )}
          />
          <Controller
            name="projectLeadId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Typography>
                <TextField select onChange={onChange} value={value} label="Project Lead" sx={{ mx: 4, my: 1 }}>
                  {users.map((t) => (
                    <MenuItem key={t.userId} value={t.userId}>
                      {fullNamePipe(t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Typography>
            )}
          />
          <Controller
            name="projectManagerId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Typography>
                <TextField select onChange={onChange} value={value} label="Project Manager" sx={{ my: 1 }}>
                  {users.map((t) => (
                    <MenuItem key={t.userId} value={t.userId}>
                      {fullNamePipe(t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Typography>
            )}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <Typography>
            <ReactHookTextField
              name="slideDeckLink"
              control={control}
              sx={{ width: '50%' }}
              label="Slide Deck Link"
              errorMessage={errors.slideDeckLink}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <Typography>
            <ReactHookTextField
              name="googleDriveFolderLink"
              control={control}
              sx={{ width: '50%' }}
              label="Google Drive Folder Link"
              errorMessage={errors.googleDriveFolderLink}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <Typography>
            <ReactHookTextField
              name="bomLink"
              control={control}
              sx={{ width: '50%' }}
              label="Bom Link"
              errorMessage={errors.bomLink}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <Typography>
            <ReactHookTextField
              name="taskListLink"
              control={control}
              sx={{ width: '50%' }}
              label="Task List Link"
              errorMessage={errors.taskListLink}
            />
          </Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
