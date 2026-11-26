/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { NERButton } from '../../components/NERButton';
import ErrorPage from '../ErrorPage';
import { useGenerateOrganizationApiToken, useHasOrganizationApiToken } from '../../hooks/organizations.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import ApiKeyDisplayModal from '../SettingsPage/ApiKey/ApiKeyDisplayModal';
import RegenerateApiKeyModal from '../SettingsPage/ApiKey/RegenerateApiKeyModal';

/**
 * Lets admins generate the organization's bot API token: the only token allowed to act on behalf of a
 * Slack user. It belongs to the organization rather than to whichever admin generated it.
 */
const AdminToolsSlackBotToken: React.FC = () => {
  const { data: hasApiToken, isLoading, isError, error } = useHasOrganizationApiToken();
  const { mutateAsync: generateApiToken, isLoading: isGenerating } = useGenerateOrganizationApiToken();
  const toast = useToast();

  const [generatedToken, setGeneratedToken] = useState<string | undefined>();
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onGenerate = async () => {
    try {
      const newToken = await generateApiToken();
      setShowRegenerateConfirm(false);
      setGeneratedToken(newToken);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  return (
    <Box mt={4} mb={4}>
      <Typography variant="h5" gutterBottom color={'#ef4345'} borderBottom={1} borderColor={'white'}>
        Slack Bot API Key
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        The Slack bot uses this key to act on behalf of the person messaging it, identified by their Slack id. It belongs to
        the organization rather than to you, and it's the only key that can act as another user.
      </Typography>

      <Typography variant="body2" mt={1}>
        {hasApiToken ? 'A Slack bot key has been generated.' : 'No Slack bot key has been generated yet.'}
      </Typography>

      <NERButton
        variant="contained"
        sx={{ mt: 2 }}
        disabled={isGenerating}
        onClick={hasApiToken ? () => setShowRegenerateConfirm(true) : onGenerate}
      >
        {hasApiToken ? 'Regenerate Slack Bot Key' : 'Generate a Slack Bot Key'}
      </NERButton>

      <RegenerateApiKeyModal
        open={showRegenerateConfirm}
        onHide={() => setShowRegenerateConfirm(false)}
        onConfirm={onGenerate}
        disabled={isGenerating}
        title="Regenerate Slack Bot Key"
      />

      <ApiKeyDisplayModal
        open={!!generatedToken}
        onHide={() => setGeneratedToken(undefined)}
        token={generatedToken ?? ''}
        title="New Slack Bot Key"
        actsAs="any member of the organization"
      />
    </Box>
  );
};

export default AdminToolsSlackBotToken;
