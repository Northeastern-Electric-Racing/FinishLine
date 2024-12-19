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

const ProgressBarWithValue: React.FC<ProgressBarWithValueProps> = ({ value }) => {
  return (
    <Box position="relative" display="flex" alignItems="center">
      <StyledProgressBar variant="determinate" value={value} style={{ width: '100%' }} />
      {
        <Typography variant="caption" color="white" position="absolute" left="50%" right="50%">
          {`${Math.round(value)}%`}
        </Typography>
      }
    </Box>
  );
};

export default ProgressBarWithValue;
