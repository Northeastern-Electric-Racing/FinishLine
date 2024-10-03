import { Box, Grid, Typography } from '@mui/material';
import { TeamType } from 'shared';
import { getImageUrl } from '../../../utils/image.utils';
import { useState, useEffect } from 'react';

interface TeamTypeSectionProps {
  teamType: TeamType;
}

const TeamTypeSection = ({ teamType }: TeamTypeSectionProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    setImageUrl('');

    const fetchImageUrl = async () => {
      if (teamType.imageFileId) {
        const url = await getImageUrl(teamType.imageFileId);
        setImageUrl(url);
      }
    };

    fetchImageUrl();
  }, [teamType.imageFileId]);

  return (
    <Grid container spacing={2} alignItems="center">
      {imageUrl && (
        <Grid item xs={4}>
          <Box component="img" src={imageUrl} sx={{ maxWidth: '100%', mt: 1, mb: 1 }} />
        </Grid>
      )}
      <Grid item xs={8}>
        <Typography variant="body1">{teamType.description}</Typography>
      </Grid>
    </Grid>
  );
};

export default TeamTypeSection;
