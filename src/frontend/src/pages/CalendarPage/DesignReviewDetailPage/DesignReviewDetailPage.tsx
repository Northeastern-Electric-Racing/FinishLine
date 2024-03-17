import { Autocomplete, Box, Checkbox, Grid, TextField, useTheme } from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import { usersToAvailabilities, existingMeetingData } from '../../../utils/design-review.utils';
import AvailabilityView from './AvailabilityView';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

interface DesignReviewDetailPageProps {
  name: string;
}

const DesignReviewDetailPage: React.FC<DesignReviewDetailPageProps> = ({ name }) => {
  const theme = useTheme();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const [requiredUsers, setRequiredUsers] = useState([].map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState([].map(userToAutocompleteOption));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());

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
          <Box sx={{ padding: 1.5, fontSize: '1.2em', backgroundColor: 'grey', borderRadius: 3, textAlign: 'center', width: '80%' }}>
            {name}
          </Box>
        </Grid>
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
            Date
          </Box>
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            value={selectedDate}
            onChange={(newValue: Date | null) => {
              setSelectedDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
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
            Time
          </Box>
        </Grid>
        <Grid item xs={3}>
          <TimePicker
            value={selectedTime}
            onChange={(newValue: Date | null) => {
              setSelectedTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={2}>
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
            <Grid item xs={4}>
              <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id} // What is this for
                  multiple
                  disableCloseOnSelect
                  limitTags={1}
                  renderTags={() => null}
                  id="required-users"
                  options={users.filter((user) => !optionalUsers.some((optUser) => optUser.id === user.id))}
                  value={requiredUsers}
                  onChange={(_event, newValue) => setRequiredUsers(newValue)}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder={`${requiredUsers.length} users selected`} />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={2}>
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
            <Grid item xs={4}>
              <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id} // What is this for
                  multiple
                  disableCloseOnSelect
                  limitTags={1}
                  renderTags={() => null}
                  id="optional-users"
                  options={users.filter((user) => !requiredUsers.some((reqUser) => reqUser.id === user.id))}
                  value={optionalUsers}
                  onChange={(_event, newValue) => setOptionalUsers(newValue)}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder={`${optionalUsers.length} users selected`} />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <AvailabilityView
        title={'Battery'}
        usersToAvailabilities={usersToAvailabilities}
        existingMeetingData={existingMeetingData}
      />
    </PageLayout>
  );
};

export default DesignReviewDetailPage;
