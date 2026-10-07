/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { isValidSlackUserIdFormat } from 'shared';
import NERModal from '../../../components/NERModal';
import ExternalLink from '../../../components/ExternalLink';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser, useSingleUserSettings, useUpdateUserSettings } from '../../../hooks/users.hooks';

interface SetSlackIdModalProps {
  open: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const SetSlackIdModal: React.FC<SetSlackIdModalProps> = ({ open, onHide, onSuccess }) => {
  const toast = useToast();
  const user = useCurrentUser();
  const {
    data: userSettings,
    isLoading: userSettingsIsLoading,
    isError: userSettingsIsError,
    error: userSettingsError
  } = useSingleUserSettings(user.userId);
  const { mutateAsync, isLoading } = useUpdateUserSettings();
  const [slackId, setSlackId] = useState('');
  const [formatError, setFormatError] = useState(false);

  const handleSubmit = async () => {
    if (!isValidSlackUserIdFormat(slackId)) {
      setFormatError(true);
      return;
    }
    if (!userSettings) return;

    try {
      await mutateAsync({ ...userSettings, slackId });
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (userSettingsIsError) return <ErrorPage message={userSettingsError?.message} />;
  if (userSettingsIsLoading || !userSettings) return <LoadingIndicator />;

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Set Your Slack ID"
      onSubmit={handleSubmit}
      disabled={isLoading}
      submitText="Save"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography>The last step before finishing onboarding is to set your Slack ID.</Typography>
        <ExternalLink
          link="https://www.workast.com/help/article/how-to-find-a-slack-user-id/"
          description="How to find your Slack ID"
        />
        <TextField
          label="Slack ID"
          value={slackId}
          onChange={(e) => {
            setSlackId(e.target.value);
            setFormatError(false);
          }}
          error={formatError}
          helperText={formatError ? "That doesn't look like a valid Slack ID" : undefined}
        />
      </Box>
    </NERModal>
  );
};

export default SetSlackIdModal;
