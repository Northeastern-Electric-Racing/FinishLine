import { Typography, Link } from '@mui/material';

// component for the DR pills that are links (zoom and docs)
export const DesignReviewPill: React.FC<{
  icon: React.ReactNode;
  isLink: boolean;
  linkText?: string;
  displayText: string;
}> = ({ icon, linkText, displayText, isLink }) => {
  return (
    <Typography
      sx={{
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingX: 1,
        width: 'fit-content'
      }}
    >
      {icon}
      {isLink ? (
        <Link target="_blank" sx={{ color: 'white' }} href={linkText} paddingLeft="5px">
          <Typography fontSize={14} paddingLeft="5px">
            {displayText}
          </Typography>
        </Link>
      ) : (
        <Typography fontSize={14} paddingLeft="5px">
          {displayText}
        </Typography>
      )}
    </Typography>
  );
};
