import { Box, LinearProgress, linearProgressClasses, styled, SxProps, Typography } from '@mui/material';

interface ProgressBarWithValueProps {
  value: number;
  text?: string;
  typographySx?: SxProps;
  progressBarSx?: SxProps;
}

const StyledProgressBar = styled(LinearProgress)(() => ({
  height: '2.5vh',
  borderRadius: 15,
  border: '1px solid white',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'transparent'
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#ef4345'
  }
}));

const OnboardingProgressBar: React.FC<ProgressBarWithValueProps> = ({ value, text, typographySx, progressBarSx }) => {
  return (
    <Box position="relative" display="flex" alignItems="center" width="100%">
      <StyledProgressBar variant="determinate" value={value} style={{ flexGrow: 1 }} sx={progressBarSx} />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          left: '10px',
          fontWeight: 'bold',
          color: value > 50 ? 'white' : 'text.primary',
          ...typographySx
        }}
      >
        {`${Math.round(value)}% ${text}`}
      </Typography>
    </Box>
  );
};

export default OnboardingProgressBar;
