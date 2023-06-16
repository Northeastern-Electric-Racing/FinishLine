import { User } from 'shared';
import { FormControl, FormLabel, Grid } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { ProjectEditFormInput } from './ProjectEditContainer';
import { Control, FieldErrorsImpl } from 'react-hook-form';

interface ProjectEditDetailsProps {
  users: User[];
  control: Control<ProjectEditFormInput>;
  errors: FieldErrorsImpl<ProjectEditFormInput>;
  projectManager?: string;
  projectLead?: string;
  setProjectManager: (projectManager?: string) => void;
  setProjectLead: (projectLead?: string) => void;
}

const userToAutocompleteOption = (user?: User): { label: string; id: string } => {
  if (!user) return { label: '', id: '' };
  return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
};

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({
  users,
  control,
  errors,
  projectManager,
  projectLead,
  setProjectLead,
  setProjectManager
}) => {
  return (
    <PageBlock title="Project Details">
      <Grid container xs={12} sx={{ my: 1 }}>
        <Grid item xs={8}>
          <FormControl sx={{ width: '90%' }}>
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
          <FormControl sx={{ width: '90%' }}>
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
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel>Project Lead</FormLabel>
          <NERAutocomplete
            sx={{ width: '90%' }}
            id="users-autocomplete"
            onChange={(_event, value) => setProjectLead(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Lead"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectLead))}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel>Project Manager</FormLabel>
          <NERAutocomplete
            sx={{ width: '90%' }}
            id="users-autocomplete"
            onChange={(_event, value) => setProjectManager(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Manager"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectManager))}
          />
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <FormControl sx={{ width: '80%' }}>
            {/* TODO: slide deck changed to confluence in frontend - needs to be updated in the backend */}
            <FormLabel>Confluence Link</FormLabel>
            <ReactHookTextField
              name="slideDeckLink"
              control={control}
              placeholder="Enter confluence link..."
              errorMessage={errors.slideDeckLink}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <FormControl sx={{ width: '80%' }}>
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
          <FormControl sx={{ width: '80%' }}>
            <FormLabel>Bom Link</FormLabel>
            <ReactHookTextField
              name="bomLink"
              control={control}
              placeholder="Enter bom link..."
              errorMessage={errors.bomLink}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12} sx={{ my: 1 }}>
          <FormControl sx={{ width: '80%' }}>
            <FormLabel>Task List Link</FormLabel>
            <ReactHookTextField
              name="taskListLink"
              control={control}
              placeholder="Enter task list link..."
              errorMessage={errors.taskListLink}
            />
          </FormControl>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
