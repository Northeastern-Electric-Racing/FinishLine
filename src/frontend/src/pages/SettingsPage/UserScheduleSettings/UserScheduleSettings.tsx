/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { IconButton, Box } from '@mui/material';
import UserScheduleSettingsView from './UserScheduleSettingsView';
import UserScheduleSettingsEdit from './UserScheduleSettingsEdit';
import PageBlock from '../../../layouts/PageBlock';
import { User } from 'shared';
import { useUserScheduleSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

export interface ScheduleSettingsFormInput {
  email: string;
  zoomLink: string;
}

const UserScheduleSettings = ({ user }: { user: User }) => {
  const [edit, setEdit] = useState(false);

  const { data, isLoading, isError, error } = useUserScheduleSettings(user.userId);

  if (!data || isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage error={error} message={error.message} />;

  const handleConfirm = async (payload: { email: string; zoomLink: string; availabilities: number[] }) => {
    setEdit(false);
  };

  return (
    <PageBlock
      title="User Schedule Settings"
      headerRight={
        !edit ? (
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
        )
      }
    >
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
    </PageBlock>
  );
};

export default UserScheduleSettings;
