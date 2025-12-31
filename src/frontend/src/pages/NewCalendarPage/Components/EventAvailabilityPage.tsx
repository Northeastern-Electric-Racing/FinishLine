/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery as useQueryParam } from '../../../hooks/utils.hooks';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import {
  Availability,
  getMostRecentAvailabilities,
  User,
  UserWithScheduleSettings,
  Event,
  TeamCalendarPreview
} from 'shared';
import PageLayout from '../../../components/PageLayout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser, useUserScheduleSettings, useManyUsersWithScheduleSettings } from '../../../hooks/users.hooks';
import { useSingleEvent, useMarkUserConfirmed } from '../../../hooks/calendar.hooks';
import { useParams, useHistory } from 'react-router-dom';
import { eventNamePipe, fullNamePipe } from '../../../utils/pipes';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import { deeplyCopy } from 'shared/src/utils';
import { availabilityTransformer } from '../../../apis/transformers/users.transformers';
import AvailabilityScheduleView from '../../CalendarPage/EventDetailPage/AvailabilityScheduleView';
import SingleAvailabilityModal from '../../SettingsPage/UserScheduleSettings/Availability/SingleAvailabilityModal';
import AvailabilityEditModal from '../../SettingsPage/UserScheduleSettings/Availability/AvailabilityEditModal';

const isUserOnEvent = (user: User, event: Event): boolean => {
  const isDirectMember =
    event.requiredMembers?.some((member: User) => member.userId === user.userId) ||
    event.optionalMembers?.some((member: User) => member.userId === user.userId);

  if (isDirectMember) return true;

  const isOnEventTeam = event.teams?.some(
    (team: TeamCalendarPreview) =>
      team.members?.some((member: User) => member.userId === user.userId) ||
      team.leads?.some((lead: User) => lead.userId === user.userId) ||
      team.head?.userId === user.userId
  );

  if (isOnEventTeam) return true;

  if (event.teamType?.teams) {
    const isOnTeamType = event.teamType.teams.some(
      (team: TeamCalendarPreview) =>
        team.members?.some((member: User) => member.userId === user.userId) ||
        team.leads?.some((lead: User) => lead.userId === user.userId) ||
        team.head?.userId === user.userId
    );
    if (isOnTeamType) return true;
  }

  if (event.userCreated?.userId === user.userId) return true;

  return false;
};

export const EventAvailabilityPage: React.FC = () => {
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
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  const { data: event, isError: eventError, error: eventErrorMsg, isLoading: eventLoading } = useSingleEvent(eventId);

  const {
    data: userScheduleSettings,
    isLoading: settingsLoading,
    isError: settingsIsError,
    error: settingsError
  } = useUserScheduleSettings(currentUser.userId);

  const allRelevantUserIds = useMemo(() => {
    if (!event) return [];

    const userIds = new Set<string>();

    // Add required and optional members
    event.requiredMembers.forEach((m) => userIds.add(m.userId));
    event.optionalMembers.forEach((m) => userIds.add(m.userId));

    // Add creator
    userIds.add(event.userCreated.userId);

    // Add team members
    event.teams.forEach((team) => {
      team.members.forEach((m) => userIds.add(m.userId));
      team.leads.forEach((l) => userIds.add(l.userId));
      userIds.add(team.head.userId);
    });

    // Add team type members
    if (event.teamType) {
      event.teamType.teams.forEach((team) => {
        team.members.forEach((m) => userIds.add(m.userId));
        team.leads.forEach((l) => userIds.add(l.userId));
        userIds.add(team.head.userId);
      });
    }

    return Array.from(userIds);
  }, [event]);

  const {
    data: relevantUsers,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorMsg
  } = useManyUsersWithScheduleSettings(allRelevantUserIds);

  const { mutateAsync: markUserConfirmed } = useMarkUserConfirmed(eventId);

  const displayDate = useMemo(() => {
    if (dateParam) {
      return new Date(dateParam);
    }
    const raw = event?.scheduledTimes?.[0]?.initialDateScheduled;
    return raw ? new Date(raw as any) : new Date();
  }, [dateParam, event?.scheduledTimes]);

  const isUserMember = useMemo(() => {
    if (!event) return false;
    return isUserOnEvent(currentUser, event);
  }, [currentUser, event]);

  useEffect(() => {
    if (userScheduleSettings && userScheduleSettings.availabilities.length > 0) {
      const confirmed = getMostRecentAvailabilities(userScheduleSettings.availabilities, displayDate);
      setConfirmedAvailabilities(new Map(confirmed.map((availability) => [availability.dateSet.getTime(), availability])));
    } else {
      setConfirmedAvailabilities(new Map());
    }
  }, [userScheduleSettings, displayDate]);

  if (eventLoading || !event) return <LoadingIndicator />;
  if (eventError) return <ErrorPage error={eventErrorMsg} message={eventErrorMsg?.message} />;

  if (settingsLoading) return <LoadingIndicator />;
  if (settingsIsError || !userScheduleSettings) return <ErrorPage message={settingsError?.message} />;

  if (usersLoading || !relevantUsers) return <LoadingIndicator />;
  if (usersError) return <ErrorPage error={usersErrorMsg} />;

  const workPackageNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ') || event.title;
  const editModalTitle = `Update your availability for ${workPackageNames} on the week of ${displayDate.toLocaleDateString()}`;

  const handleConfirm = async () => {
    try {
      await markUserConfirmed({ availability: Array.from(confirmedAvailabilities.values()) });
      toast.success('Availability Confirmed!');
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

  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const usersToAvailabilities = new Map<User, Availability[]>();
  const existingMeetingData = new Map<number, string>();

  relevantUsers.forEach((user: UserWithScheduleSettings) => {
    const availability = getMostRecentAvailabilities(user.scheduleSettings?.availabilities ?? [], displayDate);
    usersToAvailabilities.set(user, availability ?? []);
  });

  const dateRangeTitle = `Week of ${displayDate.toLocaleDateString()}`;

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

  // RENDER
  return (
    <PageLayout title={`Availability for ${eventNamePipe(event)}`}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* My Availability Section */}
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              p: 3,
              height: '100%',
              minHeight: 350,
              maxHeight: 350
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              My Availability
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {getAvailabilitySummary()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <NERSuccessButton
                variant="contained"
                onClick={() => setViewAvailabilityOpen(true)}
                disabled={userScheduleSettings.availabilities.length === 0}
              >
                View My Availability
              </NERSuccessButton>
              <NERSuccessButton variant="contained" onClick={() => setEditAvailabilityOpen(true)} disabled={!isUserMember}>
                Edit My Availability
              </NERSuccessButton>
            </Box>
            {!isUserMember && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                You must be a member of this event to edit availability.
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              p: 3,
              height: '100%',
              minHeight: 350,
              maxHeight: 350
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              {eventNamePipe(event)} Availability
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {currentAvailableUsers.length > 0
                ? `${currentAvailableUsers.length}/${relevantUsers.length} available`
                : 'Click a time slot to see availability'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 1 }}>
                  Available
                </Typography>
                <Box sx={{ height: 100, overflowY: 'auto' }}>
                  {currentAvailableUsers.length > 0 ? (
                    currentAvailableUsers.map((user) => (
                      <Typography key={user.userId} variant="body2">
                        {fullNamePipe(user)}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Click a time slot to see availability
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textDecoration: 'underline', mb: 1 }}>
                  Unavailable
                </Typography>
                <Box sx={{ height: 100, overflowY: 'auto' }}>
                  {currentUnavailableUsers.length > 0 ? (
                    currentUnavailableUsers.map((user) => (
                      <Typography key={user.userId} variant="body2">
                        {fullNamePipe(user)}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Click a time slot to see availability
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 2, p: 3 }}>
            <AvailabilityScheduleView
              availableUsers={availableUsers}
              unavailableUsers={unavailableUsers}
              usersToAvailabilities={usersToAvailabilities}
              existingMeetingData={existingMeetingData}
              setCurrentAvailableUsers={setCurrentAvailableUsers}
              setCurrentUnavailableUsers={setCurrentUnavailableUsers}
              dateRangeTitle={dateRangeTitle}
              event={event}
              displayDate={displayDate}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <NERFailButton onClick={handleClose}>Close</NERFailButton>
      </Box>

      <SingleAvailabilityModal
        open={viewAvailabilityOpen}
        onHide={() => setViewAvailabilityOpen(false)}
        header="My Availability"
        availabilites={userScheduleSettings.availabilities}
        initialDate={displayDate}
      />

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
