/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { ThemeName, UserSettings as UserSettingsType } from 'shared';
import { useUpdateUserSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import UserSettingsEdit from './UserSettingsEdit';
import UserSettingsView from './UserSettingsView';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton, Box, Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';

interface UserSettingsProps {
  currentSettings: UserSettingsType;
}

export interface SettingsFormInput {
  defaultTheme: ThemeName;
  slackId: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ currentSettings }) => {
  const [edit, setEdit] = useState(false);
  const {
    mutateAsync: updateUserSettings,
    isLoading: updateUserSettingsIsLoading,
    isError: updateUserSettingsIsError,
    error: updateUserSettingsError
  } = useUpdateUserSettings();
  const toast = useToast();

  if (updateUserSettingsIsLoading) return <LoadingIndicator />;
  if (updateUserSettingsIsError) return <ErrorPage error={updateUserSettingsError!} />;

  const handleConfirm = async ({ defaultTheme, slackId }: SettingsFormInput) => {
    setEdit(false);
    try {
      const refreshOnNewTheme: boolean = currentSettings.defaultTheme !== defaultTheme;
      await updateUserSettings({
        id: currentSettings.id,
        defaultTheme,
        slackId
      });
      if (refreshOnNewTheme) window.location.reload();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <>
      <Grid container direction={'row'} spacing={edit ? 2 : 1}>
        <Grid item>
          <Typography variant="h5">User Settings</Typography>
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
              <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
                Save
              </NERSuccessButton>
            </Box>
          )}
        </Grid>
      </Grid>
      <Grid container>
        {!edit ? (
          <UserSettingsView settings={currentSettings} />
        ) : (
          <UserSettingsEdit currentSettings={currentSettings} onSubmit={handleConfirm} />
        )}
      </Grid>
    </>
  );
};

export default UserSettings;
