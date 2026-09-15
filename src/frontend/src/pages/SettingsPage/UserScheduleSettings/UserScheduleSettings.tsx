/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { IconButton, Box, Grid, Typography } from '@mui/material';
import UserScheduleSettingsView from './UserScheduleSettingsView';
import UserScheduleSettingsEdit from './UserScheduleSettingsEdit';
import {
  AuthenticatedUser,
  Availability,
  AvailabilityCreateArgs,
  getMostRecentAvailabilities,
  SetUserScheduleSettingsArgs
} from 'shared';
import { useUpdateUserScheduleSettings, useUserScheduleSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';
import { useSingleEvent } from '../../../hooks/calendar.hooks';
import { useQuery } from '../../../hooks/utils.hooks';
import { deeplyCopy } from 'shared';
import { availabilityTransformer } from '../../../apis/transformers/users.transformers';

export interface ScheduleSettingsFormInput {
  personalGmail?: string;
  personalZoomLink?: string;
  importedIcsCalendarUrl?: string;
}

export interface ScheduleSettingsPayload extends ScheduleSettingsFormInput {
  availability: AvailabilityCreateArgs[];
}

const UserScheduleSettings = ({ user }: { user: AuthenticatedUser }) => {
  const [edit, setEdit] = useState(false);
  const toast = useToast();
  const query = useQuery();
  const eventId = query.get('eventId');

  const { data, isLoading, isError, error } = useUserScheduleSettings(user.userId);
  const {
    mutateAsync: updateUserScheduleSettings,
    isLoading: updateUserScheduleSettingsIsLoading,
    isError: updateUserScheduleSettingsIsError,
    error: updateUserScheduleSettingsError
  } = useUpdateUserScheduleSettings();
  const {
    data: event,
    isError: eventIsError,
    error: eventError,
    isLoading: eventIsLoading
  } = useSingleEvent(eventId ?? undefined);

  if (eventId && (!event || eventIsLoading)) return <LoadingIndicator />;
  if (!data || isLoading || updateUserScheduleSettingsIsLoading) return <LoadingIndicator />;

  if (eventId && eventIsError) return <ErrorPage message={eventError.message} />;
  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (updateUserScheduleSettingsIsError)
    return <ErrorPage error={updateUserScheduleSettingsError!} message={updateUserScheduleSettingsError?.message} />;

  const handleConfirm = async (payload: SetUserScheduleSettingsArgs) => {
    setEdit(false);

    try {
      await updateUserScheduleSettings({
        drScheduleSettingsId: data.drScheduleSettingsId,
        ...payload
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const defaultValues: SetUserScheduleSettingsArgs = {
    personalGmail: data.personalGmail,
    personalZoomLink: data.personalZoomLink,
    importedIcsCalendarUrl: data.importedIcsCalendarUrl,
    availability: getMostRecentAvailabilities(data.availabilities, new Date())
  };

  return (
    <>
      <Grid
        container
        direction={'row'}
        spacing={edit ? 2 : 1}
        mt={1}
        borderBottom={1}
        borderColor={'white'}
        marginBottom={'20px'}
        paddingBottom={'5px'}
      >
        <Grid item>
          <Typography gutterBottom color={'primary'} variant="h5">
            Schedule Settings
          </Typography>
        </Grid>
        <Grid item>
          {!edit ? (
            <IconButton onClick={() => setEdit(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
              <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-schedule-settings">
                Save
              </NERSuccessButton>
            </Box>
          )}
        </Grid>
      </Grid>
      {!edit ? (
        <UserScheduleSettingsView scheduleSettings={data} event={event} />
      ) : (
        <UserScheduleSettingsEdit
          onSubmit={handleConfirm}
          totalAvailabilities={deeplyCopy(data.availabilities, availabilityTransformer) as Availability[]}
          defaultValues={defaultValues}
        />
      )}
      {edit && (
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            marginTop: '20px'
          }}
        >
          <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
          <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-schedule-settings">
            Save
          </NERSuccessButton>
        </Box>
      )}
    </>
  );
};

export default UserScheduleSettings;
