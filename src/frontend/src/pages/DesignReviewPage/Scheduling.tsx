import { Autocomplete, Box, Grid, TextField, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { usersToAvailabilities, existingMeetingData } from '../../utils/design-review.utils';
import DRCView from './DesignReviewView';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllUsers } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { userToAutocompleteOption } from '../../utils/teams.utils';
import { useState } from 'react';
import { User } from 'shared';

interface SchedulingProps {
  name: string;
}

const Scheduling: React.FC<SchedulingProps> = ({ name }) => {
  const theme = useTheme();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const [requiredUsers, setRequiredUsers] = useState([].map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState([].map(userToAutocompleteOption));
  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allUsersIsLoading || !allUsers) return <LoadingIndicator />;

  const users = allUsers.map(userToAutocompleteOption);

  return (
    <PageLayout title="Scheduling">
      <Grid container spacing={3} display={'flex'} paddingBottom={2}>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1.5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline',
              fontSize: '1.2em'
            }}
          >
            Name
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1.5, fontSize: '1.2em', backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            {name}
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1,
              paddingTop: 1.5,
              paddingBottom: 1.5,
              fontSize: '1.2em',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline'
            }}
          >
            Required
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.id === value.id} // What is this for
              multiple
              id="required-users"
              options={users}
              value={requiredUsers}
              onChange={(_event, newValue) => setRequiredUsers(newValue)}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select A User" />}
            />
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1,
              paddingTop: 1.5,
              paddingBottom: 1.5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline',
              fontSize: '1.2em'
            }}
          >
            Optional
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              id="optional-users"
              options={users}
              value={optionalUsers}
              onChange={(_event, newValue) => setOptionalUsers(newValue)}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select A User" />}
            />
          </Box>
        </Grid>
      </Grid>
      <DRCView title={'Battery'} usersToAvailabilities={usersToAvailabilities} existingMeetingData={existingMeetingData} />
    </PageLayout>
  );
};

export default Scheduling;
