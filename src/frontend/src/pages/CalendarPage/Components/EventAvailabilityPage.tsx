/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery as useQueryParam } from '../../../hooks/utils.hooks';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Availability,
  getMostRecentAvailabilities,
  User,
  UserWithScheduleSettings,
  EventWithMembers,
  isAdmin,
  EventStatus
} from 'shared';
import PageLayout from '../../../components/PageLayout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser, useUserScheduleSettings, useManyUsersWithScheduleSettings } from '../../../hooks/users.hooks';
import { useMarkUserConfirmed, useSingleEventWithMembers } from '../../../hooks/calendar.hooks';
import { useParams, useHistory } from 'react-router-dom';
import { eventNamePipe, fullNamePipe } from '../../../utils/pipes';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import { deeplyCopy } from 'shared/src/utils';
import { availabilityTransformer } from '../../../apis/transformers/users.transformers';
import SingleAvailabilityModal from '../../SettingsPage/UserScheduleSettings/Availability/SingleAvailabilityModal';
import AvailabilityEditModal from '../../SettingsPage/UserScheduleSettings/Availability/AvailabilityEditModal';
import AvailabilityScheduleView from '../AvailabilityScheduleView';
import ScheduleEventModal from './ScheduleEventModal';

const isUserOnEvent = (user: User, event: EventWithMembers): boolean => {
  const isDirectMember =
    event.requiredMembers?.some((member: User) => member.userId === user.userId) ||
    event.optionalMembers?.some((member: User) => member.userId === user.userId);

  if (isDirectMember) return true;

  const isOnEventTeam = event.teams?.some(
    (team) =>
      team.members?.some((member: User) => member.userId === user.userId) ||
      team.leads?.some((lead: User) => lead.userId === user.userId) ||
      team.head?.userId === user.userId
  );

  if (isOnEventTeam) return true;

  if (event.teamType?.teams) {
    const isOnTeamType = event.teamType.teams.some(
      (team) =>
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
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [viewAvailabilityOpen, setViewAvailabilityOpen] = useState(false);
  const [confirmedAvailabilities, setConfirmedAvailabilities] = useState<Map<number, Availability>>(new Map());
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);
  const [currentHoveredSlot, setCurrentHoveredSlot] = useState<{ day: Date; startHour: number; endHour: number } | null>(
    null
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: Date; startHour: number; endHour: number } | null>(null);

  const {
    data: event,
    isError: eventError,
    error: eventErrorMsg,
    isLoading: eventLoading
  } = useSingleEventWithMembers(eventId);

  const {
    data: userScheduleSettings,
    isLoading: settingsLoading,
    isError: settingsIsError,
    error: settingsError
  } = useUserScheduleSettings(currentUser.userId);

  // Only include required and optional members plus creator (not team members)
  const allRelevantUserIds = useMemo(() => {
    if (!event) return [];

    const userIds = new Set<string>();

    // Add required and optional members only
    event.requiredMembers.forEach((m) => userIds.add(m.userId));
    event.optionalMembers.forEach((m) => userIds.add(m.userId));

    // Add creator
    userIds.add(event.userCreated.userId);

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
    return event?.initialDateScheduled ?? new Date();
  }, [dateParam, event]);

  const isUserMember = useMemo(() => {
    if (!event) return false;
    return isUserOnEvent(currentUser, event);
  }, [currentUser, event]);

  // Determine if current user is the creator
  const isCreator = useMemo(() => {
    if (!event) return false;
    return event.userCreated.userId === currentUser.userId;
  }, [event, currentUser]);

  // Check if current user has already confirmed
  const hasConfirmed = useMemo(() => {
    if (!event) return false;
    return event.confirmedMembers.some((m) => m.userId === currentUser.userId);
  }, [event, currentUser]);

  useEffect(() => {
    if (userScheduleSettings && userScheduleSettings.availabilities.length > 0) {
      const confirmed = getMostRecentAvailabilities(userScheduleSettings.availabilities, displayDate);
      setConfirmedAvailabilities(new Map(confirmed.map((availability) => [availability.dateSet.getTime(), availability])));
    } else {
      setConfirmedAvailabilities(new Map());
    }
  }, [userScheduleSettings, displayDate]);

  const isMobile = useMediaQuery('(max-width:480px)');

  // Auto-open modal for users who haven't confirmed (runs once when event loads)
  useEffect(() => {
    if (!hasAutoOpened && event && !hasConfirmed && !isMobile) {
      setEditAvailabilityOpen(true);
      setHasAutoOpened(true);
    }
  }, [event, hasAutoOpened, hasConfirmed, isMobile]);

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
    history.push(routes.CALENDAR);
  };

  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const usersToAvailabilities = new Map<User, Availability[]>();

  relevantUsers.forEach((user: UserWithScheduleSettings) => {
    const availability = getMostRecentAvailabilities(user.scheduleSettings?.availabilities ?? [], displayDate);
    usersToAvailabilities.set(user, availability ?? []);
  });

  // Handler for when creator clicks a slot to select it
  const handleSlotScheduleClick = (day: Date | null, startHour: number, endHour: number) => {
    if (day === null) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ day, startHour, endHour });
    }
  };

  // Handler for Schedule button click
  const handleScheduleClick = () => {
    if (selectedSlot) {
      setScheduleModalOpen(true);
    }
  };

  // Format time for display
  const formatHour = (hour: number) => {
    if (hour > 12) return `${hour - 12}:00 PM`;
    if (hour === 12) return '12:00 PM';
    return `${hour}:00 AM`;
  };

  // MOBILE EDIT OPEN RENDER
  if (isMobile && editAvailabilityOpen) {
    return (
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
    );
  }

  // RENDER NORMALLY
  return (
    <PageLayout
      title={workPackageNames}
      headerRight={
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <NERSuccessButton variant="contained" onClick={() => setEditAvailabilityOpen(true)} disabled={!isUserMember}>
            Edit My Availability
          </NERSuccessButton>
          <NERFailButton onClick={handleClose}>Back to Calendar</NERFailButton>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden', width: '100%', height: 'calc(100vh - 200px)' }}>
        {/* Left side - Availability Grid */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, height: '100%', overflow: 'hidden' }}>
          <AvailabilityScheduleView
            availableUsers={availableUsers}
            unavailableUsers={unavailableUsers}
            usersToAvailabilities={usersToAvailabilities}
            setCurrentAvailableUsers={setCurrentAvailableUsers}
            setCurrentUnavailableUsers={setCurrentUnavailableUsers}
            setCurrentHoveredSlot={setCurrentHoveredSlot}
            event={event}
            displayDate={displayDate}
            onSlotScheduleClick={handleSlotScheduleClick}
          />
        </Box>

        {/* Right side - User availability info */}
        <Box
          sx={{
            flex: '0 0 auto',
            width: { xs: 180, sm: 220, md: 280 },
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            p: { xs: 1.5, sm: 2, md: 3 },
            overflowY: 'auto',
            height: '100%'
          }}
        >
          {/* Date/Time display */}
          {(() => {
            const displaySlot = currentHoveredSlot || selectedSlot;
            if (displaySlot) {
              return (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    {displaySlot.day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {formatHour(displaySlot.startHour)} - {formatHour(displaySlot.endHour)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {currentAvailableUsers.length}/{relevantUsers.length} available
                  </Typography>
                </Box>
              );
            }
            return (
              <Typography variant="body1" color="text.secondary" mb={3}>
                Hover over a time slot to see availability
              </Typography>
            );
          })()}

          {/* Available/Unavailable columns */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Available
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {currentAvailableUsers.length > 0 ? (
                  currentAvailableUsers.map((user) => {
                    const isConfirmed = event.confirmedMembers.some((cm) => cm.userId === user.userId);
                    const displayName = fullNamePipe(user) + (isConfirmed ? '' : ' *');
                    return (
                      <Typography key={user.userId} variant="body2" sx={{ py: 0.25 }}>
                        {displayName}
                      </Typography>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Unavailable
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {currentUnavailableUsers.length > 0 ? (
                  currentUnavailableUsers.map((user) => {
                    const isConfirmed = event.confirmedMembers.some((cm) => cm.userId === user.userId);
                    const displayName = fullNamePipe(user) + (isConfirmed ? '' : ' *');
                    return (
                      <Typography key={user.userId} variant="body2" sx={{ py: 0.25 }}>
                        {displayName}
                      </Typography>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {(currentAvailableUsers.length > 0 || currentUnavailableUsers.length > 0) && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              * has not confirmed availability
            </Typography>
          )}

          {/* Schedule button for creators - only show if event is not already scheduled */}
          {(isCreator || isAdmin(currentUser.role)) && selectedSlot && event.status !== EventStatus.SCHEDULED && (
            <Box sx={{ mt: 3 }}>
              <NERSuccessButton variant="contained" onClick={handleScheduleClick} fullWidth>
                Schedule Event
              </NERSuccessButton>
            </Box>
          )}
        </Box>
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
      {selectedSlot && (
        <ScheduleEventModal
          open={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedSlot(null);
          }}
          eventId={eventId}
          eventName={eventNamePipe(event)}
          selectedDay={selectedSlot.day}
          startHour={selectedSlot.startHour}
          endHour={selectedSlot.endHour}
        />
      )}
    </PageLayout>
  );
};
