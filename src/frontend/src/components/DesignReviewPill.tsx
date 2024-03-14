import { Typography, Link } from '@mui/material';

export const DesignReviewPill: React.FC<{
  icon: React.ReactNode;
  isLink: boolean;
  linkURL?: string;
  displayText: string;
}> = ({ icon, linkURL, displayText, isLink }) => {
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
        <Link target="_blank" sx={{ color: 'white' }} href={linkURL} paddingLeft="5px">
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
