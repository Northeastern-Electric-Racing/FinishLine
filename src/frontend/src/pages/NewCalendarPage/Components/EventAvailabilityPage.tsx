/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery as useQueryParam } from '../../../hooks/utils.hooks';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Availability, getMostRecentAvailabilities, User, UserWithScheduleSettings } from 'shared';
import PageLayout from '../../../components/PageLayout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser, useUserScheduleSettings, useManyUsersWithScheduleSettings } from '../../../hooks/users.hooks';
import { useSingleEvent, useMarkUserConfirmed } from '../../../hooks/calendar.hooks';
import { useParams, useHistory } from 'react-router-dom';
import { eventNamePipe } from '../../../utils/pipes';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import { deeplyCopy } from 'shared/src/utils';
import { availabilityTransformer } from '../../../apis/transformers/users.transformers';
import AvailabilityScheduleView from '../../CalendarPage/EventDetailPage/AvailabilityScheduleView';
import SingleAvailabilityModal from '../../SettingsPage/UserScheduleSettings/Availability/SingleAvailabilityModal';
import AvailabilityEditModal from '../../SettingsPage/UserScheduleSettings/Availability/AvailabilityEditModal';

const EventAvailabilityPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const queryParams = useQueryParam();
  const dateParam = queryParams.get('date');
  const theme = useTheme();
  const history = useHistory();
  const toast = useToast();
  const currentUser = useCurrentUser();

  const [editAvailabilityOpen, setEditAvailabilityOpen] = useState(false);
  const [viewAvailabilityOpen, setViewAvailabilityOpen] = useState(false);
  const [confirmedAvailabilities, setConfirmedAvailabilities] = useState<Map<number, Availability>>(new Map());
  //const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  //const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  const { data: event, isError: eventError, error: eventErrorMsg, isLoading: eventLoading } = useSingleEvent(eventId);

  const {
    data: userScheduleSettings,
    isLoading: settingsLoading,
    isError: settingsIsError,
    error: settingsError
  } = useUserScheduleSettings(currentUser.userId);

  // Get required and optional member IDs (use empty arrays if event not loaded yet)
  const requiredUserIds = event?.requiredMembers.map((m) => m.userId) || [];
  const optionalUserIds = event?.optionalMembers.map((m) => m.userId) || [];
  const allRelevantUserIds = [...requiredUserIds, ...optionalUserIds];

  const {
    data: relevantUsers,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorMsg
  } = useManyUsersWithScheduleSettings(allRelevantUserIds);

  const { mutateAsync: markUserConfirmed } = useMarkUserConfirmed(eventId);

  // Get the date to show availability for
  const displayDate = useMemo(() => {
    if (dateParam) {
      return new Date(dateParam);
    }
    // Fall back to initial scheduled date
    const raw = event?.scheduledTimes?.[0]?.initialDateScheduled;
    return raw ? new Date(raw as any) : new Date();
  }, [dateParam, event?.scheduledTimes]);

  useEffect(() => {
    if (userScheduleSettings && userScheduleSettings.availabilities.length > 0) {
      const confirmed = getMostRecentAvailabilities(userScheduleSettings.availabilities, displayDate);
      setConfirmedAvailabilities(new Map(confirmed.map((availability) => [availability.dateSet.getTime(), availability])));
    } else {
      // Clear availabilities if no schedule settings
      setConfirmedAvailabilities(new Map());
    }
  }, [userScheduleSettings, displayDate]);

  // NOW do conditional returns AFTER all hooks
  if (eventLoading || !event) return <LoadingIndicator />;
  if (eventError) return <ErrorPage error={eventErrorMsg} message={eventErrorMsg?.message} />;

  if (settingsLoading) return <LoadingIndicator />;
  if (settingsIsError || !userScheduleSettings) return <ErrorPage message={settingsError?.message} />;

  if (usersLoading || !relevantUsers) return <LoadingIndicator />;
  if (usersError) return <ErrorPage error={usersErrorMsg} />;

  // Get work package names for the modal title
  const workPackageNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ') || event.title;
  const editModalTitle = `Update your availability for ${workPackageNames} on the week of ${displayDate.toLocaleDateString()}`;

  const handleConfirm = async () => {
    try {
      await markUserConfirmed({ availability: Array.from(confirmedAvailabilities.values()) });
      toast.success('Availability saved successfully!');
      setEditAvailabilityOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleClose = () => {
    history.push(routes.NEW_CALENDAR);
  };

  // Build maps for AvailabilityScheduleView
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const usersToAvailabilities = new Map<User, Availability[]>();
  const existingMeetingData = new Map<number, string>();

  relevantUsers.forEach((user: UserWithScheduleSettings) => {
    const availability = getMostRecentAvailabilities(user.scheduleSettings?.availabilities ?? [], displayDate);
    usersToAvailabilities.set(user, availability ?? []);
  });

  const onSelectedTimeslotChanged = (_index: number | null, _day: Date | null) => {
    // This could be used to show detailed info about a specific timeslot if needed
  };

  const dateRangeTitle = `Week of ${displayDate.toLocaleDateString()}`;

  // Get display text for user's availability
  const getAvailabilitySummary = () => {
    if (confirmedAvailabilities.size === 0) {
      return 'No availability set yet. Click "Edit My Availability" to get started.';
    }
    const totalSlots = Array.from(confirmedAvailabilities.values()).reduce(
      (sum, avail) => sum + avail.availability.length,
      0
    );
    return `${totalSlots} time slot${totalSlots !== 1 ? 's' : ''} marked as available`;
  };

  return (
    <PageLayout title={`Availability for ${eventNamePipe(event)}`}>
      <Grid container spacing={4}>
        {/* My Availability Section */}
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 2, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                My Availability
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <NERSuccessButton
                  variant="outlined"
                  onClick={() => setViewAvailabilityOpen(true)}
                  disabled={userScheduleSettings.availabilities.length === 0}
                >
                  View My Availability
                </NERSuccessButton>
                <NERSuccessButton variant="contained" onClick={() => setEditAvailabilityOpen(true)}>
                  Edit My Availability
                </NERSuccessButton>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getAvailabilitySummary()}
            </Typography>
          </Box>
        </Grid>

        {/* Event-Wide Availability Section */}
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 2, p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Team Availability
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Showing availability for all required and optional members. Darker colors indicate more people are available.
            </Typography>
            <AvailabilityScheduleView
              availableUsers={availableUsers}
              unavailableUsers={unavailableUsers}
              usersToAvailabilities={usersToAvailabilities}
              existingMeetingData={existingMeetingData}
              setCurrentAvailableUsers={setCurrentAvailableUsers}
              setCurrentUnavailableUsers={setCurrentUnavailableUsers}
              dateRangeTitle={dateRangeTitle}
              onSelectedTimeslotChanged={onSelectedTimeslotChanged}
              event={event}
              displayDate={displayDate}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <NERFailButton onClick={handleClose}>Close</NERFailButton>
      </Box>

      {/* View Availability Modal */}
      <SingleAvailabilityModal
        open={viewAvailabilityOpen}
        onHide={() => setViewAvailabilityOpen(false)}
        header="My Availability"
        availabilites={userScheduleSettings.availabilities}
      />

      {/* Edit Availability Modal */}
      <AvailabilityEditModal
        open={editAvailabilityOpen}
        onHide={() => setEditAvailabilityOpen(false)}
        header={editModalTitle}
        confirmedAvailabilities={confirmedAvailabilities}
        setConfirmedAvailabilities={setConfirmedAvailabilities}
        totalAvailabilities={deeplyCopy(userScheduleSettings.availabilities, availabilityTransformer) as Availability[]}
        initialDate={displayDate}
        onSubmit={handleConfirm}
        canChangeDateRange={false}
      />
    </PageLayout>
  );
};

export default EventAvailabilityPage;
