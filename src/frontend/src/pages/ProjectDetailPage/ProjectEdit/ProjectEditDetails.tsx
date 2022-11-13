import { Project, User, WbsElementStatus } from 'shared';
import { Controller } from 'react-hook-form';
import { Grid, Select, MenuItem } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/Pipes';

interface ProjectEditDetailsProps {
  project: Project;
  users: User[];
  control: any;
}

const statuses = Object.values(WbsElementStatus);

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({ project, users, control }) => {
  return (
    <PageBlock title="Project Details">
      <Grid item xs={12} sm={12}>
        <Grid item sx={{ mb: 1 }}>
          <Controller
            name="wbsElementStatus"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select onChange={onChange} value={value}>
                {statuses.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <ReactHookTextField name="name" control={control} sx={{ width: '50%' }} label="Project Name" />
      </Grid>
      <Grid item xs={12} md={6}>
        <ReactHookTextField
          name="budget"
          control={control}
          sx={{ width: '15%' }}
          type="number"
          label="Budget"
          icon={<AttachMoneyIcon />}
        />
      </Grid>
      <Grid item>
        <Controller
          name="projectLeadId"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Select onChange={onChange} value={value}>
              {users.map((t) => (
                <MenuItem key={t.userId} value={t.userId}>
                  {fullNamePipe(t)}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <Controller
          name="projectManagerId"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Select onChange={onChange} value={value}>
              {users.map((t) => (
                <MenuItem key={t.userId} value={t.userId}>
                  {fullNamePipe(t)}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </Grid>
      <Grid item>
        <ReactHookTextField name="slideDeckLink" control={control} sx={{ width: '50%' }} label="Slide Deck Link" />
      </Grid>
      <Grid item>
        <ReactHookTextField
          name="googleDriveFolderLink"
          control={control}
          sx={{ width: '50%' }}
          label="Google Drive Folder Link"
        />
      </Grid>
      <Grid item>
        <ReactHookTextField name="bomLink" control={control} sx={{ width: '50%' }} label="Bom Link" />
      </Grid>
      <Grid item>
        <ReactHookTextField name="taskListLink" control={control} sx={{ width: '50%' }} label="Task List Link" />
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
