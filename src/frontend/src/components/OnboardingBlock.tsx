import { Box, Grid, Typography, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Organization } from 'shared';

interface OnboardingBlockProps {
  organization: Organization;
  isAdmin?: boolean;
}

const OnboardingBlock: React.FC<OnboardingBlockProps> = ({ organization, isAdmin }) => {
  const theme = useTheme();
  const handleEdit = () => {
    console.log('clicked');
    // use NER MODEL component and call the hook here
  };

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
          {isAdmin && (
            <EditIcon sx={{ marginRight: '15px', marginTop: '20px', cursor: 'pointer' }} onClick={handleEdit}></EditIcon>
          )}
        </Box>
        <Typography sx={{ mt: 1, mb: -1, ml: 2, fontSize: { xs: 16, sm: 16, md: 18 }, marginRight: '15px' }}>
          {organization.onboardingText}
        </Typography>
      </Box>
    </Grid>
  );
};

export default OnboardingBlock;
