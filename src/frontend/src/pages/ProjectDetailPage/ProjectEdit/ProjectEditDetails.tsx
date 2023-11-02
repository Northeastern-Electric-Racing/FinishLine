import { User } from 'shared';
import { Box, FormControl, FormLabel, Grid, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { fullNamePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { ProjectEditFormInput } from './ProjectEditContainer';
import { Control, FieldErrorsImpl } from 'react-hook-form';
import { AttachMoney } from '@mui/icons-material';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';
import TeamDropdown from '../../../components/TeamsDropdown';

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
    <Box>
      <Typography variant="h5" sx={{ marginBottom: '10px' }}>
        Project Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item lg={2.4} xs={12}>
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
        <Grid item lg={2.4} xs={12}>
          <FormControl fullWidth>
            <ChangeRequestDropdown control={control} name="crId" />
          </FormControl>
        </Grid>
        <Grid item lg={2.4} xs={12}>
          <FormControl fullWidth>
            <FormLabel>Car Number</FormLabel>
            <ReactHookTextField
              name="car-number"
              control={control}
              placeholder="Enter a car number..."
              errorMessage={errors.name}
            />
          </FormControl>
        </Grid>
        <Grid item lg={2.4} xs={12}>
          <FormControl fullWidth>
            <TeamDropdown control={control} name="teamId" />
          </FormControl>
        </Grid>
        <Grid item lg={2.4} xs={12}>
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
      </Grid>
      <Grid container spacing={2}>
        <Grid item lg={4} xs={12} mt={{ xs: 3, lg: 1 }}>
          <FormControl fullWidth>
            <FormLabel>Project Summary</FormLabel>
            <ReactHookTextField
              name="summary"
              control={control}
              type="number"
              placeholder="Enter a summmary..."
              multiline={true}
              rows={5}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3} mt={1}>
          <FormLabel>Project Lead</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectLead(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Lead"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectLead))}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ mt: 1 }}>
          <FormLabel>Project Manager</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectManager(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Manager"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectManager))}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectEditDetails;
