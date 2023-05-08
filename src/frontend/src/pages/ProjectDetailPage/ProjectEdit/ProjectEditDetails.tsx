import { User } from 'shared';
import { FormControl, FormLabel, Grid } from '@mui/material';
import PageBlock from '../../../layouts/PageBlock';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fullNamePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';

interface ProjectEditDetailsProps {
  users: User[];
  control: any;
  errors: any;
}

const ProjectEditDetails: React.FC<ProjectEditDetailsProps> = ({ users, control, errors }) => {
  const [user, setUser] = useState<User | null>(null);

  const userToAutocompleteOption = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  const usersSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const user = users.find((user: User) => user.userId.toString() === value.id);
      if (user) {
        setUser(user);
      }
    } else {
      setUser(null);
    }
  };

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
        <Grid item xs={12} md={3}>
          <FormLabel>Project Lead</FormLabel>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={usersSearchOnChange}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Lead"
            value={user ? userToAutocompleteOption(user) : null}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl>
            <FormLabel>Project Manager</FormLabel>
            <NERAutocomplete
            id="users-autocomplete"
            onChange={usersSearchOnChange}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a Project Manager"
            value={user ? userToAutocompleteOption(user) : null}
          />
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ my: 1 }}>
          <FormControl sx={{ width: '80%' }}>
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
