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
import { NERButton } from '../../../components/NERButton';
import { Grid, IconButton } from '@mui/material';

interface UserSettingsProps {
  userId: number;
}

export interface FormInput {
  defaultTheme: ThemeName;
  slackId: string;
}

const UserSettings = ({ userId }: UserSettingsProps) => {
  const [edit, setEdit] = useState(false);
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);
  const update = useUpdateUserSettings();

  if (isLoading || !userSettingsData || update.isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (update.isError) return <ErrorPage error={update.error!} message={update.error?.message!} />;

  const handleConfirm = async ({ defaultTheme, slackId }: FormInput) => {
    setEdit(false);
    await update.mutateAsync({ id: userSettingsData.id!, defaultTheme, slackId });
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
          <UserSettingsView settings={userSettingsData} />
        ) : (
          <UserSettingsEdit currentSettings={userSettingsData} onSubmit={handleConfirm} />
        )}
      </Grid>
    </PageBlock>
  );
};

export default UserSettings;
