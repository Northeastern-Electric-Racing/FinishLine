/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { ThemeName } from 'shared';
import { useToggleTheme } from '../../../hooks/theme.hooks';
import { useSingleUserSettings, useUpdateUserSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import UserSettingsEdit from './UserSettingsEdit';
import UserSettingsView from './UserSettingsView';
import { NERButton } from '../../../components/NERButton';
import { Grid, IconButton } from '@mui/material';

interface UserSettingsProps {
  userId: number;
}

export interface FormInput {
  defaultTheme: ThemeName;
  slackId: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userId }) => {
  const [edit, setEdit] = useState(false);
  const userSettings = useSingleUserSettings(userId);
  const update = useUpdateUserSettings();
  const theme = useToggleTheme();

  if (userSettings.isLoading || update.isLoading) return <LoadingIndicator />;
  if (userSettings.isError) return <ErrorPage error={userSettings.error} message={userSettings.error.message} />;
  if (update.isError) return <ErrorPage error={update.error!} message={update.error?.message!} />;

  const handleConfirm = async ({ defaultTheme, slackId }: FormInput) => {
    setEdit(false);
    await update.mutateAsync({ id: userSettings.data?.id!, defaultTheme, slackId });
    const res = await userSettings.refetch();
    if (res.data?.defaultTheme && res.data?.defaultTheme !== theme.activeTheme.toUpperCase()) {
      theme.toggleTheme();
    }
  };

  return (
    <PageBlock
      title="User Settings"
      headerRight={
        !edit ? (
          <IconButton onClick={() => setEdit(true)}>
            <FontAwesomeIcon icon={faPencilAlt} size="sm" />
          </IconButton>
        ) : (
          <div className="d-flex flex-row">
            <NERButton onClick={() => setEdit(false)}>Cancel</NERButton>
            <NERButton type="submit" form="update-user-settings">
              Save
            </NERButton>
          </div>
        )
      }
    >
      <Grid container>
        {!edit ? (
          <UserSettingsView settings={userSettings.data!} />
        ) : (
          <UserSettingsEdit currentSettings={userSettings.data!} onSubmit={handleConfirm} />
        )}
      </Grid>
    </PageBlock>
  );
};

export default UserSettings;
