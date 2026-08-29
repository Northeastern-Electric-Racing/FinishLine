import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { datePipe } from '../../../utils/pipes';
import DetailDisplay from '../../../components/DetailDisplay';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import ErrorPage from '../../ErrorPage';
import { useCurrentUserApiToken, useGenerateApiToken } from '../../../hooks/users.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import ApiKeyDisplayModal from './ApiKeyDisplayModal';
import RegenerateApiKeyModal from './RegenerateApiKeyModal';

const ApiKeySection: React.FC = () => {
  const { data: apiToken, isLoading, isError, error } = useCurrentUserApiToken();
  const { mutateAsync: generateApiToken, isLoading: isGenerating } = useGenerateApiToken();
  const toast = useToast();

  const [generatedToken, setGeneratedToken] = useState<string | undefined>();
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onGenerate = async () => {
    setShowRegenerateConfirm(false);
    try {
      const newToken = await generateApiToken();
      setGeneratedToken(newToken.token);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom color={'primary'} borderBottom={1} borderColor={'white'}>
        API Key
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        An API key lets external tools read FinishLine data as you, with your permissions.
      </Typography>

      {apiToken && (
        <Grid container direction="column" spacing={0.5} mt={0.5}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <DetailDisplay label="Key" content={`fl_••••••••${apiToken.preview}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <DetailDisplay label="Created" content={datePipe(apiToken.dateCreated)} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <DetailDisplay label="Last Used" content={apiToken.lastUsedAt ? datePipe(apiToken.lastUsedAt) : 'Never'} />
          </Grid>
        </Grid>
      )}

      <NERButton
        variant="contained"
        sx={{ mt: 2 }}
        disabled={isGenerating}
        onClick={apiToken ? () => setShowRegenerateConfirm(true) : onGenerate}
      >
        {apiToken ? 'Regenerate API Key' : 'Generate an API Key'}
      </NERButton>

      {apiToken && (
        <RegenerateApiKeyModal
          open={showRegenerateConfirm}
          onHide={() => setShowRegenerateConfirm(false)}
          onConfirm={onGenerate}
          preview={apiToken.preview}
        />
      )}

      <ApiKeyDisplayModal open={!!generatedToken} onHide={() => setGeneratedToken(undefined)} token={generatedToken ?? ''} />
    </Box>
  );
};

export default ApiKeySection;
