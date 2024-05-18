import { Typography, Box } from '@mui/material';

export const DesignReviewPill: React.FC<{
  icon: React.ReactNode;
  displayText: string;
}> = ({ icon, displayText }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content'
      }}
    >
      {icon}
      <Typography fontSize={15} paddingLeft="4px">
        {displayText}
      </Typography>
    </Box>
  );
};
