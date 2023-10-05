/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography, Box, useTheme, IconButton, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import GroupIcon from '@mui/icons-material/Group';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NavPageLink from './NavPageLink';
import DrawerHeader from '../../components/DrawerHeader';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import NERDrawer from '../../components/NERDrawer';
import { LayoutProps } from '../LayoutProps';

export interface SideBarProps extends LayoutProps {
  handleDrawerClose: () => void;
}

const Sidebar: React.FC<SideBarProps> = ({ open, handleDrawerClose }) => {
  const theme = useTheme();

  const linkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <HomeIcon />,
      route: routes.HOME
    },
    {
      name: 'Gantt',
      icon: <AlignHorizontalLeftIcon />,
      route: routes.GANTT
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
    },
    {
      name: 'Finance',
      icon: <AttachMoneyIcon />,
      route: routes.FINANCE
    },
    {
      name: 'Teams',
      icon: <GroupIcon />,
      route: routes.TEAMS
    },
    {
      name: 'Info',
      icon: <QuestionMarkIcon />,
      route: routes.INFO
    }
  ];

  return (
    <NERDrawer open={open} variant="permanent">
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}</IconButton>
      </DrawerHeader>
      <Divider />
      <Box
        overflow={'auto'}
        sx={{ overflowX: 'hidden' }}
        display="flex"
        flexDirection={'column'}
        flex={1}
        justifyContent={'space-between'}
      >
        <Box>
          {linkItems.map((linkItem) => (
            <NavPageLink {...linkItem} open={open} />
          ))}
        </Box>
        <Typography className={styles.versionNumber}>4.1.0</Typography>
      </Box>
    </NERDrawer>
  );
};

export default Sidebar;
