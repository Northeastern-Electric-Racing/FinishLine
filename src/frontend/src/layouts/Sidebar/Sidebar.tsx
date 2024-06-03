/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography, Box, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import GroupIcon from '@mui/icons-material/Group';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavPageLink from './NavPageLink';
import NERDrawer from '../../components/NERDrawer';
import NavUserMenu from '../PageTitle/NavUserMenu';

interface SidebarProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const Sidebar = ({ drawerOpen, setDrawerOpen }: SidebarProps) => {
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
      name: 'Calendar',
      icon: <CalendarTodayIcon />,
      route: routes.CALENDAR
    },
    {
      name: 'Info',
      icon: <QuestionMarkIcon />,
      route: routes.INFO
    }
  ];

  return (
    <NERDrawer open={drawerOpen} variant="permanent">
      <Box
        overflow={'auto'}
        sx={{ overflowX: 'hidden' }}
        display="flex"
        flexDirection={'column'}
        flex={1}
        justifyContent={'space-evenly'}
        onMouseLeave={() => {
          setDrawerOpen(false);
        }}
      >
        <Box>
          {linkItems.map((linkItem) => (
            <NavPageLink {...linkItem} />
          ))}
          {<NavUserMenu open={drawerOpen} />}
        </Box>
        <Box justifyContent={drawerOpen ? 'flex-start' : 'center'}>
          <Box marginLeft={1.1}>
            <Typography marginLeft={1.1}>Sponsored By:</Typography>
            <Box component="img" sx={{ height: 40 }} alt="Kaleidoscope Logo" src="/kaleidoscope-logo-lockup.svg" />
          </Box>
          <Typography className={styles.versionNumber}>v4.3.5</Typography>
        </Box>
      </Box>
    </NERDrawer>
  );
};

export default Sidebar;
