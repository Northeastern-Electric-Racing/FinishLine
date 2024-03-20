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
import { User } from 'shared';
import { useUpdateUserScheduleSettings, useUserScheduleSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';

export interface ScheduleSettingsFormInput {
  personalGmail: string;
  personalZoomLink: string;
}

export interface ScheduleSettingsPayload extends ScheduleSettingsFormInput {
  availability: number[];
}

const UserScheduleSettings = ({ user }: { user: User }) => {
  const [edit, setEdit] = useState(false);
  const toast = useToast();

  const { data, isLoading, isError, error } = useUserScheduleSettings(user.userId);
  const {
    mutateAsync: updateUserScheduleSettings,
    isLoading: updateUserScheduleSettingsIsLoading,
    isError: updateUserScheduleSettingsIsError,
    error: updateUserScheduleSettingsError
  } = useUpdateUserScheduleSettings();

  if (!data || isLoading || updateUserScheduleSettingsIsLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (updateUserScheduleSettingsIsError)
    return <ErrorPage error={updateUserScheduleSettingsError!} message={updateUserScheduleSettingsError?.message} />;

  const handleConfirm = async (payload: ScheduleSettingsPayload) => {
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

  return (
    <>
      <Grid container direction={'row'} spacing={edit ? 2 : 1} mt={1}>
        <Grid item>
          <Typography gutterBottom color={'red'} borderBottom={1} borderColor={'white'} variant="h5">
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
        <UserScheduleSettingsView scheduleSettings={data} />
      ) : (
        <UserScheduleSettingsEdit onSubmit={handleConfirm} defaultValues={data} />
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
