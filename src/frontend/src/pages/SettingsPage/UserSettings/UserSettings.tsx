/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { ThemeName } from 'shared';
import { useSingleUserSettings, useUpdateUserSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import UserSettingsEdit from './UserSettingsEdit';
import UserSettingsView from './UserSettingsView';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';

interface UserSettingsProps {
  userId: number;
}

export interface FormInput {
  defaultTheme: ThemeName;
  slackId: string;
  city: string;
  street: string;
  state: string;
  zipcode: string;
  phoneNumber: string;
  nuid: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userId }) => {
  const [edit, setEdit] = useState(false);
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);
  const {
    mutateAsync: updateUserSettings,
    isLoading: updateUserSettingsIsLoading,
    isError: updateUserSettingsIsError,
    error: updateUserSettingsError
  } = useUpdateUserSettings();
  const toast = useToast();

  if (isLoading || !userSettingsData || updateUserSettingsIsLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (updateUserSettingsIsError) return <ErrorPage error={updateUserSettingsError!} />;

  const handleConfirm = async ({ defaultTheme, slackId, street, city, state, zipcode, phoneNumber, nuid }: FormInput) => {
    setEdit(false);
    try {
      await updateUserSettings({
        id: userSettingsData.id!,
        defaultTheme,
        slackId,
        city,
        street,
        state,
        zipcode,
        phoneNumber,
        nuid,
        userSecureSettingsId: userSettingsData.userSecureSettingsId!
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <PageBlock
      title="User Settings"
      headerRight={
        !edit ? (
          <IconButton onClick={() => setEdit(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <div className="d-flex flex-row">
            <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
            <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
              Save
            </NERSuccessButton>
          </div>
        )
      }
    >
      <Grid container>
        {!edit ? (
          <UserSettingsView settings={userSettingsData} />
        ) : (
          <UserSettingsEdit currentSettings={userSettingsData} onSubmit={handleConfirm} />
        )}
      </Grid>
    </PageBlock>
  );
};

export default UserSettings;
