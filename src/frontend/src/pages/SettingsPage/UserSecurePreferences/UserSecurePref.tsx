/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton, Box } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';
import { useUpdateUserSecureSettings } from '../../../hooks/users.hooks';
import UserSecureSettingsView from '../UserSecureSettings/UserSecureSettingsView';
import UserSecureSettingsEdit from '../UserSecureSettings/UserSecureSettingsEdit';
import { UserSecureSettings as UserSecureSettingsType } from 'shared';
import { SecureSettingsFormInput } from '../UserSecureSettings/UserSecureSettings';

interface SecureSettingsProps {
  currentSettings: UserSecureSettingsType;
}

const UserSecurePref: React.FC<SecureSettingsProps> = ({ currentSettings }) => {
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
    <Grid container columnSpacing={2}>
      <Grid item xs={edit ? 12 : 11} md={10.5}>
        {!edit ? (
          <UserSecureSettingsView settings={currentSettings} />
        ) : (
          <UserSecureSettingsEdit currentSettings={currentSettings} onSubmit={handleConfirm} />
        )}
      </Grid>
      <Grid item xs={edit ? 12 : 1} md={1.5}>
        {!edit ? (
          <IconButton onClick={() => setEdit(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box
            className="d-flex flex-row"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              marginTop: '20px'
            }}
          >
            <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
            <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
              Save
            </NERSuccessButton>
          </Box>
        )}
        {edit && (
          <Box
            className="d-flex flex-col"
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
      </Grid>
    </Grid>
  );
};

export default UserSecurePref;
