import { Grid, Typography, TextField, Box } from '@mui/material';
import { useGetPartReviewGuideLink, useSetPartReviewGuideLink } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { useEffect, useState } from 'react';

const ConfluenceLink: React.FC = () => {
  const toast = useToast();
  const { data: guideLink, isLoading, error } = useGetPartReviewGuideLink();
  const { mutateAsync: setGuideLink } = useSetPartReviewGuideLink();
  const [guideLinkValue, setGuideLinkValue] = useState('');

  useEffect(() => {
    setGuideLinkValue(guideLink ?? '');
  }, [guideLink]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorPage message="Error loading part review guide link." error={error} />;
  }

  const handleSubmit = async () => {
    try {
      await setGuideLink(guideLinkValue);
      toast.success('Guide link updated successfully');
    } catch (err) {
      toast.error('Failed to update guide link');
    }
  };

  return (
    <Grid>
      <Typography variant="h6">Confluence Drawing Guide</Typography>
      <TextField
        fullWidth
        value={guideLinkValue}
        onChange={(e) => setGuideLinkValue(e.target.value)}
        placeholder="Enter Confluence guide link"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right' }}>
        <NERButton variant="contained" onClick={handleSubmit}>
          Update Guide Link
        </NERButton>
      </Box>
    </Grid>
  );
};

export default ConfluenceLink;
