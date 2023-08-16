import Icon from '@mui/material/Icon';
import { Box } from '@mui/system';
import { Link as SharedLink } from 'shared';
import { Link } from '@mui/material';

const LinkView: React.FC<{ link: SharedLink }> = ({ link }) => {
  return (
    <Box display={'flex'} textAlign={'center'} sx={{ verticalAlign: 'middle' }} alignItems={'center'}>
      <Icon>{link.linkType.iconName}</Icon>
      <Link href={link.url} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
        {link.linkType.name}
      </Link>
    </Box>
  );
};

export default LinkView;
