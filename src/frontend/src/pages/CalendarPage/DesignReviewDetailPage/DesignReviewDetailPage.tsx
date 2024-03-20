import { Autocomplete, Box, Checkbox, Grid, TextField, useTheme } from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import { getDateRange } from '../../../utils/design-review.utils';
import AvailabilityView from './AvailabilityView';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useEffect, useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { DesignReview, User, UserWithScheduleSettings } from 'shared';
import { wbsPipe } from 'shared';
import { useAllDesignReviews } from '../../../hooks/design-reviews.hooks';

interface DesignReviewDetailPageProps {
  designReview: DesignReview;
}

const DesignReviewDetailPage: React.FC<DesignReviewDetailPageProps> = ({ designReview }) => {
  const theme = useTheme();

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const {
    data: allDesignReviews,
    isError: allDesignReviewsIsError,
    error: allDesignReviewsError,
    isLoading: allDesignReviewsIsLoading
  } = useAllDesignReviews();

  const [requiredUsers, setRequiredUsers] = useState([].map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState([].map(userToAutocompleteOption));
  const [selectedStartDateTime, setselectedStartDateTime] = useState(
    new Date(`${new Date().toLocaleDateString()} 12:00:00`)
  );
  const [selectedEndDateTime, setselectedEndDateTime] = useState(new Date(`${new Date().toLocaleDateString()} 12:00:00`));
  const [usersToAvailabilities, setUsersToAvailabilities] = useState<Map<User, number[]>>(new Map());
  const [existingMeetingData, setexistingMeetingData] = useState<Map<number, string>>(new Map());
  const [dateRange, setDateRange] = useState('');
  const designReviewName = `${wbsPipe(designReview.wbsNum)} - ${designReview.wbsName}`;
  const conflictingDesignReviews = allDesignReviews
    ? allDesignReviews.filter(
        (currDr) =>
          currDr.dateScheduled.toLocaleDateString() === selectedStartDateTime.toLocaleDateString() &&
          allDesignReviews.some((designReview) =>
            designReview.meetingTimes.some((time) => currDr.meetingTimes.includes(time))
          ) &&
          currDr.designReviewId !== designReview.designReviewId
      )
    : [];

  useEffect(() => {
    if (allDesignReviews) {
      const newExistingMeetingData = new Map<number, string>();
      allDesignReviews?.forEach((designReview) =>
        designReview.meetingTimes.forEach((meetingTime) =>
          newExistingMeetingData.set(meetingTime, designReview.teamType.iconName)
        )
      );
      setexistingMeetingData(newExistingMeetingData);
    }
  }, [allDesignReviews]);

  useEffect(() => {
    if (designReview && designReview.confirmedMembers.length > 0) {
      const newUsersToAvailabilities = new Map<User, number[]>();
      designReview.confirmedMembers.forEach((user: UserWithScheduleSettings) => {
        newUsersToAvailabilities.set(user, user.scheduleSettings?.availability ?? []);
      });
      setUsersToAvailabilities(newUsersToAvailabilities);
    }
  }, [designReview]);

  useEffect(() => {
    setDateRange(getDateRange(selectedStartDateTime));
  }, [selectedStartDateTime]);

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allDesignReviewsIsError) return <ErrorPage message={allDesignReviewsError?.message} />;
  if (allUsersIsLoading || !allUsers || allDesignReviewsIsLoading || !allDesignReviews) return <LoadingIndicator />;

  const users = allUsers.map(userToAutocompleteOption);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const updatedDateTime = new Date(selectedStartDateTime);
      updatedDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setselectedStartDateTime(updatedDateTime);
    }
  };

  const handleTimeChange = (newTime: Date | null, isStartTime: boolean) => {
    if (newTime) {
      const updatedDateTime = new Date(selectedStartDateTime);
      updatedDateTime.setHours(newTime.getHours(), newTime.getMinutes());
      isStartTime ? setselectedStartDateTime(updatedDateTime) : setselectedEndDateTime(updatedDateTime);
    }
  };

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
            {designReviewName}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <DatePicker
            label={'Date'}
            value={selectedStartDateTime}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item xs={2}>
          <TimePicker
            label={'Start Time'}
            views={['hours']}
            value={selectedStartDateTime}
            onChange={(newTime) => handleTimeChange(newTime, true)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item xs={2}>
          <TimePicker
            label={'End Time'}
            views={['hours']}
            value={selectedEndDateTime}
            onChange={(newTime) => handleTimeChange(newTime, false)}
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
        existingMeetingData={existingMeetingData}
        designReviewName={designReviewName}
        selectedStartDateTime={selectedStartDateTime}
        conflictingDesignReviews={conflictingDesignReviews}
        dateRange={dateRange}
      />
    </PageLayout>
  );
};

export default DesignReviewDetailPage;
