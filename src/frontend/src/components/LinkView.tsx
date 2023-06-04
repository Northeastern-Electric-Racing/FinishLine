import { Box, Link } from '@mui/material';
import { Link as SharedLink } from 'shared';

const LinkView: React.FC<{ link: SharedLink }> = ({ link }) => {
  return (
    <Box>
      <Link href={link.url} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
        {link.linkType.name}
      </Link>
    </Box>
  );
};

export default LinkView;
