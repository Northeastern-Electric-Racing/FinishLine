import { User } from 'shared';
import { Box, FormControl, FormLabel, Grid, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { fullNamePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { ProjectFormInput } from './ProjectForm';
import { Control, FieldErrorsImpl } from 'react-hook-form';
import { AttachMoney } from '@mui/icons-material';
import TeamDropdown from '../../../components/TeamsDropdown';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';

interface ProjectEditDetailsProps {
  users: User[];
  control: Control<ProjectFormInput>;
  errors: FieldErrorsImpl<ProjectFormInput>;
  createProject?: boolean;
  projectManager?: string;
  projectLead?: string;
  setProjectManagerId: (projectManager?: string) => void;
  setProjectLeadId: (projectLead?: string) => void;
  setcrId?: (crId?: number) => void;
  setCarNumber?: (carNumber?: number) => void;
}

const userToAutocompleteOption = (user?: User): { label: string; id: string } => {
  if (!user) return { label: '', id: '' };
  return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
};

const ProjectFormDetails: React.FC<ProjectEditDetailsProps> = ({
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
    <Box>
      <Typography variant="h5" sx={{ marginBottom: '10px' }}>
        Project Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item lg={2.4} md={6} xs={12}>
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
        <Grid item lg={2.4} md={6} xs={12}>
          <FormControl fullWidth>
            <ChangeRequestDropdown control={control} name="crId" />
          </FormControl>
        </Grid>
        {createProject && (
          <>
            <Grid item lg={2.4} md={6} xs={12} sx={{ display: 'flex' }}>
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
            <Grid item lg={2.4} md={6} xs={12}>
              <FormControl fullWidth>
                <TeamDropdown control={control} name="teamId" />
              </FormControl>
            </Grid>
          </>
        )}
        <Grid item lg={2.4} md={6} xs={12}>
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
        <Grid item lg={6} md={12} xs={12} mt={{ xs: 3, md: 3, lg: 2 }}>
          <FormLabel>Project Lead</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectLeadId(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Lead"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectLead))}
          />
        </Grid>
        <Grid item lg={6} md={12} xs={12} mt={{ xs: 0, md: 0, lg: 2 }}>
          <FormLabel>Project Manager</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={(_event, value) => setProjectManagerId(value?.id)}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Manager"
            value={userToAutocompleteOption(users.find((user) => user.userId.toString() === projectManager))}
          />
        </Grid>
        <Grid item lg={12} md={12} xs={12}>
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
      </Grid>
    </Box>
  );
};

export default ProjectFormDetails;
