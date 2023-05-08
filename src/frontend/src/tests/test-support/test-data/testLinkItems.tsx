import { MUILinkItem } from '../../../utils/types';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { routes } from '../../../utils/routes';

export const testLinkItems: MUILinkItem[] = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    route: routes.HOME
  },
  {
    name: 'Projects',
    icon: <FolderIcon />,
    route: routes.PROJECTS
  },
  {
    name: 'Change Requests',
    icon: <SyncAltIcon />,
    route: routes.CHANGE_REQUESTS
  }
];
