/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { useUpdateUserSecureSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton, Box, Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';
import UserSecureSettingsView from './UserSecureSettingsView';
import UserSecureSettingsEdit from './UserSecureSettingsEdit';
import { UserSecureSettings as UserSecureSettingsType } from 'shared';

interface SecureSettingsProps {
  currentSettings: UserSecureSettingsType;
}

export interface SecureSettingsFormInput {
  city: string;
  street: string;
  state: string;
  zipcode: string;
  phoneNumber: string;
  nuid: string;
}

const UserSecureSettings: React.FC<SecureSettingsProps> = ({ currentSettings }) => {
  const [edit, setEdit] = useState(false);

  const {
    mutateAsync: updateSecureUserSettings,
    isLoading: updateUserSettingsIsLoading,
    isError: updateUserSettingsIsError,
    error: updateUserSettingsError
  } = useUpdateUserSecureSettings();

  const toast = useToast();

  if (updateUserSettingsIsLoading) return <LoadingIndicator />;
  if (updateUserSettingsIsError) return <ErrorPage error={updateUserSettingsError!} />;

  const handleConfirm = async ({ street, city, state, zipcode, phoneNumber, nuid }: SecureSettingsFormInput) => {
    setEdit(false);
    try {
      await updateSecureUserSettings({
        city,
        street,
        state,
        zipcode,
        phoneNumber,
        nuid,
        userSecureSettingsId: currentSettings.userSecureSettingsId
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <>
      <Grid
        container
        direction={'row'}
        spacing={edit ? 2 : 1}
        mt={1}
        paddingBottom={'5px'}
        borderColor={'white'}
        marginBottom={'20px'}
        borderBottom={1}
      >
        <Grid item>
          <Typography color={'primary'} variant="h5">
            Secure Settings
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
              <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-secure-settings">
                Save
              </NERSuccessButton>
            </Box>
          )}
        </Grid>
      </Grid>
      <Grid container>
        {!edit ? (
          <UserSecureSettingsView settings={currentSettings} />
        ) : (
          <UserSecureSettingsEdit currentSettings={currentSettings} onSubmit={handleConfirm} />
        )}
      </Grid>
      {edit && (
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            marginTop: '20px'
          }}
        >
          <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
          <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
            Save
          </NERSuccessButton>
        </Box>
      )}
    </>
  );
};

export default UserSecureSettings;
