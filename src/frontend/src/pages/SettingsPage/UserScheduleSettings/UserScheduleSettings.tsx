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
import { useUpdateUserScheduleSettings, useUserScheduleSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';
import { useSingleDesignReview } from '../../../hooks/design-reviews.hooks';
import { useQuery } from '../../../hooks/utils.hooks';

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
  const query = useQuery();
  const designReviewId = query.get('drId');

  const { data, isLoading, isError, error } = useUserScheduleSettings(user.userId);
  const {
    mutateAsync: updateUserScheduleSettings,
    isLoading: updateUserScheduleSettingsIsLoading,
    isError: updateUserScheduleSettingsIsError,
    error: updateUserScheduleSettingsError
  } = useUpdateUserScheduleSettings();
  const {
    data: designReview,
    isError: designReviewIsError,
    error: designReviewError,
    isLoading: designReviewIsLoading
  } = useSingleDesignReview(designReviewId ?? undefined);

  if (designReviewId && (!designReview || designReviewIsLoading)) return <LoadingIndicator />;
  if (!data || isLoading || updateUserScheduleSettingsIsLoading) return <LoadingIndicator />;

  if (designReviewId && designReviewIsError) return <ErrorPage message={designReviewError.message} />;
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
        <UserScheduleSettingsView scheduleSettings={data} designReview={designReview} />
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
