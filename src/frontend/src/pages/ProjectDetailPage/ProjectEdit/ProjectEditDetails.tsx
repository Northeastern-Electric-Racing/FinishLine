import { User } from 'shared';
import { Controller } from 'react-hook-form';
import { FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
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
      <Grid container xs={12} sx={{ my: 1 }}>
        <Grid container sx={{ marginBottom: '0.5%' }} gap={'5px'}>
          <FormControl sx={{ width: '60%' }}>
            <FormLabel>Project Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter project name..."
              errorMessage={errors.name}
            />
          </FormControl>
          <FormControl sx={{ width: '15%' }}>
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
      <Grid item xs={12} sx={{ my: 1 }}>
        <FormControl sx={{ width: '30%' }}>
          <FormLabel>Slide Deck Link</FormLabel>
          <ReactHookTextField
            name="slideDeckLink"
            control={control}
            placeholder="Enter slide deck link..."
            errorMessage={errors.slideDeckLink}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sx={{ my: 1 }}>
        <FormControl sx={{ width: '30%' }}>
          <FormLabel>Google Drive Folder Link</FormLabel>
          <ReactHookTextField
            name="googleDriveFolderLink"
            control={control}
            placeholder="Enter Google Drive folder link..."
            errorMessage={errors.googleDriveFolderLink}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sx={{ my: 1 }}>
        <FormControl sx={{ width: '30%' }}>
          <FormLabel>Bom Link</FormLabel>
          <ReactHookTextField
            name="bomLink"
            control={control}
            placeholder="Enter bom link..."
            errorMessage={errors.bomLink}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sx={{ my: 1 }}>
        <FormControl sx={{ width: '30%' }}>
          <FormLabel>Task List Link</FormLabel>
          <ReactHookTextField
            name="taskListLink"
            control={control}
            placeholder="Enter task list link..."
            errorMessage={errors.taskListLink}
          />
        </FormControl>
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
