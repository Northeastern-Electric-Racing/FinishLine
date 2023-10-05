import { User } from 'shared';
import { FormControl, FormLabel, Grid } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { ProjectEditFormInput } from './ProjectEditContainer';
import { Control, FieldErrorsImpl } from 'react-hook-form';
import { AttachMoney } from '@mui/icons-material';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';
import TeamDropdown from '../../../components/TeamsDropdown';
import { userToAutocompleteOption } from '../../../utils/teams.utils';

interface ProjectEditDetailsProps {
  users: User[];
  control: Control<ProjectEditFormInput>;
  errors: FieldErrorsImpl<ProjectEditFormInput>;
  projectManager?: string;
  projectLead?: string;
  setProjectManager: (projectManager?: string) => void;
  setProjectLead: (projectLead?: string) => void;
}

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
      <Grid container spacing={3}>
        <Grid item xs>
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
        <Grid item xs>
          <FormControl fullWidth>
            <ChangeRequestDropdown control={control} name="crId" />
          </FormControl>
        </Grid>
        <Grid item xs>
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
        <Grid item xs>
          <FormControl fullWidth>
            <TeamDropdown control={control} name="teamId"/>
          </FormControl>
        </Grid>
        <Grid item xs>
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
        <Grid item xs={4}>
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
        <Grid item xs={12} md={3} sx={{ mt: 1 }}>
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
    </PageBlock>
  );
};

export default ProjectEditDetails;
