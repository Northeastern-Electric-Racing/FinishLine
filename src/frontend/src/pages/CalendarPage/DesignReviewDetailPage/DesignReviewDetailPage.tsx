import { Autocomplete, Box, Checkbox, Grid, TextField, useTheme } from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import AvailabilityView from './AvailabilityView';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { DesignReview, User, UserWithScheduleSettings } from 'shared';
import { useAllDesignReviews } from '../../../hooks/design-reviews.hooks';
import { designReviewNamePipe } from '../../../utils/pipes';

interface DesignReviewDetailPageProps {
  designReview: DesignReview;
}

const DesignReviewDetailPage: React.FC<DesignReviewDetailPageProps> = ({ designReview }) => {
  const theme = useTheme();
  const [requiredUsers, setRequiredUsers] = useState([].map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState([].map(userToAutocompleteOption));
  const [date, setDate] = useState(new Date(`${new Date().toLocaleDateString()} 12:00:00`));

  const usersToAvailabilities = new Map<User, number[]>();

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const {
    data: allDesignReviews,
    isError: allDesignReviewsIsError,
    error: allDesignReviewsError,
    isLoading: allDesignReviewsIsLoading
  } = useAllDesignReviews();

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allDesignReviewsIsError) return <ErrorPage message={allDesignReviewsError?.message} />;
  if (allUsersIsLoading || !allUsers || allDesignReviewsIsLoading || !allDesignReviews) return <LoadingIndicator />;

  const users = allUsers.map(userToAutocompleteOption);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const updatedDateTime = new Date();
      updatedDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setDate(updatedDateTime);
    }
  };

  designReview.confirmedMembers.forEach((user: UserWithScheduleSettings) => {
    usersToAvailabilities.set(user, user.scheduleSettings?.availability ?? []);
  });

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
          <Box
            sx={{
              padding: 1.5,
              fontSize: '1.2em',
              backgroundColor: 'grey',
              borderRadius: 3,
              textAlign: 'center',
              width: '100%'
            }}
          >
            {designReviewNamePipe(designReview)}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <DatePicker
            label={'Date'}
            value={setDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item xs={2}>
          <TimePicker
            label={'Start Time'}
            views={['hours']}
            value={date}
            onChange={(newTime) => {}}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item xs={2}>
          <TimePicker
            label={'End Time'}
            views={['hours']}
            value={date}
            onChange={(newTime) => {}}
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
                  isOptionEqualToValue={(option, value) => option.id === value.id}
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
                  isOptionEqualToValue={(option, value) => option.id === value.id}
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
        usersToAvailabilities={usersToAvailabilities}
        designReview={designReview}
        selectedDate={date}
        allDesignReviews={allDesignReviews}
      />
    </PageLayout>
  );
};

export default DesignReviewDetailPage;
