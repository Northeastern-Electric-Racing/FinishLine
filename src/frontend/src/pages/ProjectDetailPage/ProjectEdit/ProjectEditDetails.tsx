import { User } from 'shared';
import { FormControl, FormLabel, Grid } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { fullNamePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { ProjectFormInput } from './ProjectFormContainer';
import { Control, FieldErrorsImpl } from 'react-hook-form';
import { AttachMoney } from '@mui/icons-material';

interface ProjectEditDetailsProps {
  users: User[];
  control: Control<ProjectFormInput>;
  errors: FieldErrorsImpl<ProjectFormInput>;
  createProject?: boolean;
  projectManager?: string;
  projectLead?: string;
  setProjectManagerId: (projectManager: string) => void;
  setProjectLeadId: (projectLead: string) => void;
  setcrId?: (crId?: number) => void;
  setCarNumber?: (carNumber?: number) => void;
}

const userToAutocompleteOption = (user?: User): { label: string; id: string } => {
  if (!user) return { label: '', id: '' };
  return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
};

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({
  users,
  control,
  errors,
  createProject = false,
  projectManager,
  projectLead,
  setProjectLeadId,
  setProjectManagerId
}) => {
  return (
    <PageBlock title="Project Details">
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <FormControl fullWidth>
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
          <FormControl fullWidth>
            <FormLabel>Budget</FormLabel>
            <ReactHookTextField
              name="budget"
              startAdornment={<AttachMoney />}
              control={control}
              type="number"
              placeholder="Enter budget..."
              errorMessage={errors.budget}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4} sx={{ display: createProject ? 'flex' : 'none' }}>
          <FormControl fullWidth>
            <FormLabel>crId</FormLabel>
            <ReactHookTextField
              name="crId"
              startAdornment={<AttachMoney />}
              control={control}
              type="number"
              placeholder="Enter crId..."
              errorMessage={errors.crId}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4} sx={{ display: createProject ? 'flex' : 'none' }}>
          <FormControl fullWidth>
            <FormLabel>Car Number</FormLabel>
            <ReactHookTextField
              name="carNumber"
              startAdornment={<AttachMoney />}
              control={control}
              type="number"
              placeholder="Enter Car number..."
              errorMessage={errors.crId}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel>Project Lead</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectLeadId(value?.id ?? '')}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Lead"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectLead))}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1 }}>
          <FormLabel>Project Manager</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectManagerId(value?.id ?? '')}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Manager"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectManager))}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectEditDetails;
