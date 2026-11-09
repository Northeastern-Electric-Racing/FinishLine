import Icon from '@mui/material/Icon';
import { Box } from '@mui/system';
import { LinkType } from 'shared';
import { Link } from '@mui/material';

// only what it shows, so cards can pass a slim link
const LinkView: React.FC<{ link: { url: string; linkType: Pick<LinkType, 'name' | 'iconName'> } }> = ({ link }) => {
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
