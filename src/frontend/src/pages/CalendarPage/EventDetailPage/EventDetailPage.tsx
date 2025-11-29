import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import AvailabilityView from './AvailabilityView';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker } from '@mui/x-date-pickers';
import { Event, meetingStartTimePipeNumbers } from 'shared';
import { useAllEvents } from '../../../hooks/calendar.hooks';
import { eventNamePipe } from '../../../utils/pipes';
import { HOURS } from '../../../utils/design-review.utils';

export interface EventEditData {
  requiredUserIds: string[];
  optionalUserIds: string[];
  selectedDate: Date;
  startTime: number;
  endTime: number;
}
interface EventDetailPageProps {
  event: Event;
}

export interface FinalizeEventInformation {
  docTemplateLink: string;
  zoomLink?: string;
  location?: string;
  meetingType: string[];
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ event }) => {
  const theme = useTheme();
  const [requiredUsers, setRequiredUsers] = useState(event.requiredMembers.map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState(event.optionalMembers.map(userToAutocompleteOption));

  const [firstScheduledSlot] = event.scheduledTimes;
  const lastScheduledSlot = event.scheduledTimes.at(-1);

  // Convert string dates → real Date objects (defensive)
  const parseDate = (dateInput: Date | string | undefined): Date => {
    if (!dateInput) return new Date();
    return typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  };

  const [date, setDate] = useState<Date>(
    firstScheduledSlot?.initialDateScheduled ? parseDate(firstScheduledSlot.initialDateScheduled) : new Date()
  );

  const [startTime, setStartTime] = useState<number>(
    firstScheduledSlot?.startTime ? new Date(firstScheduledSlot.startTime).getHours() - 10 : 0
  );

  const [endTime, setEndTime] = useState<number>(
    lastScheduledSlot?.endTime
      ? new Date(lastScheduledSlot.endTime).getHours() - 9 // +1 hour from start
      : 1
  );

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const {
    data: allEvents,
    isError: allEventsIsError,
    error: allEventsError,
    isLoading: allEventsIsLoading
  } = useAllEvents();

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allEventsIsError) return <ErrorPage message={allEventsError?.message} />;
  if (allUsersIsLoading || !allUsers || allEventsIsLoading || !allEvents) return <LoadingIndicator />;

  const users = allUsers.map(userToAutocompleteOption);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const updatedDateTime = new Date();
      updatedDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setDate(updatedDateTime);
    }
  };

  const handleSelectingRequiredUser = (newValue: { label: string; id: string }[]) => {
    const newRequiredUserIds = new Set(newValue.map((user) => user.id));
    const filteredOptionalUsers = optionalUsers.filter((user) => !newRequiredUserIds.has(user.id));
    setOptionalUsers(filteredOptionalUsers);
    setRequiredUsers(newValue);
  };

  const handleEdit = async () => {
    const times = [];
    for (let i = startTime; i < endTime; i++) {
      times.push(i % 12);
    }
    date.setHours(12);
    /*
    try {
      const payload: EditDesignReviewPayload = {
        dateScheduled: date,
        teamTypeId: designReview.teamType.teamTypeId,
        requiredMembersIds: requiredUsers.map((user) => user.id),
        optionalMembersIds: optionalUsers.map((user) => user.id),
        isOnline: data?.meetingType.includes('virtual') ?? false,
        isInPerson: data?.meetingType.includes('inPerson') ?? false,
        status: data ? DesignReviewStatus.SCHEDULED : designReview.status,
        attendees: [],
        meetingTimes: times,
        docTemplateLink: data?.docTemplateLink ?? designReview.docTemplateLink,
        zoomLink: data?.zoomLink ?? designReview.zoomLink,
        location: data?.location ?? designReview.location
      };
      await editDesignReview(payload);
      history.push(routes.CALENDAR);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
      */
  };

  const DateField = () => {
    return <DatePicker value={date} onChange={handleDateChange} sx={EditableFieldStyle} />;
  };

  // styling for the editable fields at the top of the page with light grey backgrounds
  const EditableFieldStyle = {
    fontSize: '16px',
    backgroundColor: 'grey',
    borderRadius: 3,
    textAlign: 'left',
    border: '2px solid',
    width: '100%'
  };

  // styling for the non-editable fields at the top of the page with dark backgrounds
  const NonEditableFieldStyle = {
    padding: 1.5,
    paddingTop: 1.5,
    paddingBottom: 1.5,
    fontSize: '1.2em',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 3,
    textAlign: 'center',
    width: '100%',
    border: 'none'
  };

  return (
    <PageLayout title="Scheduling">
      <Grid container spacing={3} display={'flex'} paddingBottom={2}>
        <Grid item xs={1}>
          <Box sx={NonEditableFieldStyle}>Name</Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ ...NonEditableFieldStyle, textDecoration: 'none' }}>{eventNamePipe(event)}</Box>
        </Grid>
        <Grid item xs={2}>
          <DateField />
        </Grid>
        <Grid item xs={3} display="flex" gap={3}>
          <Select
            id="start-time-autocomplete"
            displayEmpty
            renderValue={(value) => meetingStartTimePipeNumbers([value])}
            value={startTime}
            onChange={(event: SelectChangeEvent<number>) => setStartTime(Number(event.target.value))}
            size={'small'}
            label={'Start Time'}
            sx={EditableFieldStyle}
          >
            {HOURS.map((hour) => {
              return (
                <MenuItem key={hour} value={hour}>
                  {meetingStartTimePipeNumbers([hour])}
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
            renderValue={(value) => meetingStartTimePipeNumbers([value])}
            value={endTime}
            disabled={true}
            onChange={(event: SelectChangeEvent<number>) => setEndTime(Number(event.target.value))}
            size={'small'}
            label={'End Time'}
            sx={EditableFieldStyle}
          >
            {HOURS.map((hour) => {
              return (
                <MenuItem key={hour} value={hour}>
                  {meetingStartTimePipeNumbers([hour])}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <Box sx={NonEditableFieldStyle}>Required</Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ ...EditableFieldStyle, padding: 1 }}>
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  multiple
                  disableCloseOnSelect
                  limitTags={1}
                  renderTags={() => null}
                  id="required-users"
                  options={users}
                  value={requiredUsers}
                  onChange={(_event, newValue) => handleSelectingRequiredUser(newValue)}
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
              <Box sx={NonEditableFieldStyle}>Optional</Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ ...EditableFieldStyle, padding: 1 }}>
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
        handleEdit={handleEdit}
        event={event}
        allEvents={allEvents}
        selectedDate={date}
        setSelectDate={setDate}
        requiredUserIds={requiredUsers.map((user) => user.id)}
        optionalUserIds={optionalUsers.map((user) => user.id)}
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />
    </PageLayout>
  );
};

export default EventDetailPage;
