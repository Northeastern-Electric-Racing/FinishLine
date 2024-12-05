import { Box, Grid, Typography, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Organization } from 'shared';

interface OnboardingBlockProps {
  organization: Organization;
}

const OnboardingBlock: React.FC<OnboardingBlockProps> = ({ organization }) => {
  const theme = useTheme();
  return (
    <Grid item>
      <Box
        sx={{
          height: '25vh',
          borderRadius: '10px',
          width: '100%',
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" ml={2} pt={2}>
            Onboarding
          </Typography>
          <EditIcon sx={{ marginRight: '15px', marginTop: '20px' }}></EditIcon>
        </Box>
        <Typography sx={{ mt: 1, mb: -1, ml: 2 }}>{organization?.onboardingText}</Typography>
      </Box>
    </Grid>
  );
};

export default OnboardingBlock;
