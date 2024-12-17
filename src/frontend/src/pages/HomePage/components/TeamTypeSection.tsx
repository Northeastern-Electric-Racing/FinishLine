import { Box, Grid, Typography } from '@mui/material';
import { TeamType } from 'shared';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface TeamTypeSectionProps {
  teamType: TeamType;
}

const TeamTypeSection = ({ teamType }: TeamTypeSectionProps) => {
  const { data: imageUrl, isLoading } = useGetImageUrl(teamType.imageFileId);

  if (isLoading) return <LoadingIndicator />;

  return (
    <Grid container spacing={4} alignItems="flex-start" sx={{ p: 2 }}>
      {imageUrl ? (
        <>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={imageUrl}
              sx={{
                width: '30vw',
                height: 'auto',
                maxWidth: '400px',
                display: 'block',
                mx: 'auto'
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontSize: '1.3em', textAlign: 'left' }}>{teamType.description}</Typography>
            </Box>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '1.3em', textAlign: 'left' }}>{teamType.description}</Typography>
        </Grid>
      )}
    </Grid>
  );
};
export default TeamTypeSection;
