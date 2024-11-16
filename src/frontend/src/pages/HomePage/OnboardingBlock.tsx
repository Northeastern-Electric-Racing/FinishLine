import { Box, Typography } from '@mui/material';

interface OnboardingBlockProps {
  title: string;
  text: string;
}

const OnboardingBlock: React.FC<OnboardingBlockProps> = ({ title, text }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#272727',
        borderRadius: '8px',
        padding: 2,
        marginTop: 2,
        maxWidth: '500px'
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 1
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: '#CCCCCC',
          marginBottom: 10
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default OnboardingBlock;
