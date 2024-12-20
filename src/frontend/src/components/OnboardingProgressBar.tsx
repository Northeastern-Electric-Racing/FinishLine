import { Box, LinearProgress, linearProgressClasses, styled, Typography } from '@mui/material';

interface ProgressBarWithValueProps {
  value: number;
}

const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800]
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#ef4345'
  }
}));

const OnboardingProgressBar: React.FC<ProgressBarWithValueProps> = ({ value }) => {
  return (
    <Box position="relative" display="flex" alignItems="center" width="100%">
      <StyledProgressBar variant="determinate" value={value} style={{ flexGrow: 1 }} />
      <Typography
        variant="caption"
        sx={{
          marginLeft: 1,
          fontWeight: 'bold',
          color: 'text.primary'
        }}
      >
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  );
};

export default OnboardingProgressBar;
