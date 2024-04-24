import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import AvailabilityView from './AvailabilityView';
import { useAllUsers, useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker } from '@mui/x-date-pickers';
import { DesignReview, isAdmin } from 'shared';
import { useAllDesignReviews, useDeleteDesignReview } from '../../../hooks/design-reviews.hooks';
import { designReviewNamePipe, meetingStartTimePipe } from '../../../utils/pipes';
import { HOURS } from '../../../utils/design-review.utils';
import { useHistory } from 'react-router-dom';
import { useToast } from '../../../hooks/toasts.hooks';
import { routes } from '../../../utils/routes';
import NERModal from '../../../components/NERModal';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DesignReviewEditData {
  requiredUserIds: number[];
  optionalUserIds: number[];
  selectedDate: Date;
  startTime: number;
  endTime: number;
}
interface DesignReviewDetailPageProps {
  designReview: DesignReview;
}

const DesignReviewDetailPage: React.FC<DesignReviewDetailPageProps> = ({ designReview }) => {
  const theme = useTheme();
  const [requiredUsers, setRequiredUsers] = useState(designReview.requiredMembers.map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState(designReview.optionalMembers.map(userToAutocompleteOption));
  const [date, setDate] = useState(
    new Date(designReview.dateScheduled.getTime() - designReview.dateScheduled.getTimezoneOffset() * -60000)
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [startTime, setStateTime] = useState(designReview.meetingTimes[0] % 12);
  const [endTime, setEndTime] = useState((designReview.meetingTimes[designReview.meetingTimes.length - 1] % 12) + 1);

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const {
    data: allDesignReviews,
    isError: allDesignReviewsIsError,
    error: allDesignReviewsError,
    isLoading: allDesignReviewsIsLoading
  } = useAllDesignReviews();
  const { mutateAsync: deleteDesignReview } = useDeleteDesignReview(designReview.designReviewId);
  const history = useHistory();
  const toast = useToast();
  const user = useCurrentUser();

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allDesignReviewsIsError) return <ErrorPage message={allDesignReviewsError?.message} />;
  if (allUsersIsLoading || !allUsers || allDesignReviewsIsLoading || !allDesignReviews) return <LoadingIndicator />;

  const users = allUsers.filter((user) => user.scheduleSettings).map(userToAutocompleteOption);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const updatedDateTime = new Date();
      updatedDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setDate(updatedDateTime);
    }
  };

  const handleDelete = () => {
    try {
      deleteDesignReview();
      history.push(routes.CALENDAR);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this design review?</Typography>
      </NERModal>
    );
  };

  const hasDeletePerms = user.userId === designReview.userCreated.userId || isAdmin(user.role);

  return (
    <PageLayout
      title="Scheduling"
      headerRight={
        hasDeletePerms && (
          <IconButton onClick={() => setShowDeleteModal(true)}>
            <DeleteIcon />
          </IconButton>
        )
      }
    >
      <DeleteModal />
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
        <Grid item xs={6}>
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
          <DatePicker value={date} onChange={handleDateChange} />
        </Grid>
        <Grid item xs={3} display="flex" gap={3}>
          <Select
            id="start-time-autocomplete"
            displayEmpty
            renderValue={(value) => meetingStartTimePipe([value])}
            value={startTime}
            onChange={(event: SelectChangeEvent<number>) => setStateTime(Number(event.target.value))}
            size={'small'}
            placeholder={'Start Time'}
            sx={{ height: 56, width: '100%', textAlign: 'left' }}
          >
            {HOURS.map((hour) => {
              return (
                <MenuItem key={hour} value={hour}>
                  {meetingStartTimePipe([hour])}
                </MenuItem>
              );
            })}
          </Select>
          <Typography minWidth={'20px'} display={'flex'} flexDirection="column" justifyContent="center">
            to
          </Typography>
          <Select
            id="end-time-autocomplete"
            displayEmpty
            renderValue={(value) => meetingStartTimePipe([value])}
            value={endTime}
            onChange={(event: SelectChangeEvent<number>) => setEndTime(Number(event.target.value))}
            size={'small'}
            placeholder={'End Time'}
            sx={{ height: 56, width: '100%', textAlign: 'left' }}
          >
            {HOURS.map((hour) => {
              return (
                <MenuItem key={hour} value={hour}>
                  {meetingStartTimePipe([hour])}
                </MenuItem>
              );
            })}
          </Select>
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
              <Box sx={{ padding: 1, border: 1, borderColors: 'grey', borderRadius: 3, textAlign: 'center' }}>
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
                    <TextField
                      {...params}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      variant="standard"
                      placeholder={`${requiredUsers.length} users selected`}
                    />
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
              <Box sx={{ padding: 1, border: 1, borderColors: 'grey', borderRadius: 3, textAlign: 'center' }}>
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
                    <TextField
                      {...params}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      variant="standard"
                      placeholder={`${optionalUsers.length} users selected`}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <AvailabilityView
        editPayload={{
          requiredUserIds: requiredUsers.map((option) => Number(option.id)),
          optionalUserIds: optionalUsers.map((option) => Number(option.id)),
          selectedDate: date,
          startTime,
          endTime
        }}
        designReview={designReview}
        allDesignReviews={allDesignReviews}
        allUsers={allUsers}
      />
    </PageLayout>
  );
};

export default DesignReviewDetailPage;
