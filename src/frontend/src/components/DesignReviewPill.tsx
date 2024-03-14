import { Typography, Link, Box } from '@mui/material';

export const DesignReviewPill: React.FC<{
  icon: React.ReactNode;
  isLink: boolean;
  linkURL?: string;
  displayText: string;
}> = ({ icon, linkURL, displayText, isLink }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingX: 1,
        width: 'fit-content'
      }}
    >
      {icon}
      {isLink ? (
        <Link target="_blank" color="inherit" href={linkURL} paddingLeft="4px">
          <Typography fontSize={15}>{displayText}</Typography>
        </Link>
      ) : (
        <Typography fontSize={15} paddingLeft="4px">
          {displayText}
        </Typography>
      )}
    </Box>
  );
};
