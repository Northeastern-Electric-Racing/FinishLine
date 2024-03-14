/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography, Box, useTheme, IconButton, Divider, Stack } from '@mui/material';
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
import { GridMenuIcon } from '@mui/x-data-grid';
import { useState } from 'react';
import NavUserMenu from '../PageTitle/NavUserMenu';

interface SidebarProps {
  defaultOpen?: boolean;
}

const Sidebar = ({ defaultOpen = false }: SidebarProps) => {
  const theme = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(defaultOpen);

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
    <NERDrawer open={drawerOpen} variant="permanent">
      <DrawerHeader>
        {drawerOpen ? (
          <IconButton onClick={() => setDrawerOpen(false)}>
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            sx={{
              marginRight: 0.5
            }}
          >
            <GridMenuIcon />
          </IconButton>
        )}
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
            <NavPageLink {...linkItem} open={drawerOpen} />
          ))}
          {<NavUserMenu open={drawerOpen} />}
        </Box>
        <Box justifyContent={drawerOpen ? 'flex-start' : 'center'}>
          {drawerOpen ? (
            <Box marginLeft={1.1}>
              <Typography marginLeft={1.1}>Sponsored By:</Typography>
              <Box component="img" sx={{ height: 40 }} alt="Kaleidoscope Logo" src="/kaleidoscope-logo-lockup.svg" />
            </Box>
          ) : (
            <Stack direction={'row'} justifyContent={'center'}>
              <Box component="img" sx={{ height: 40 }} alt="Kaleidoscope Logo" src="/kaleidoscope-logo.svg" />
            </Stack>
          )}
          <Typography className={styles.versionNumber}>v4.3.5</Typography>
        </Box>
      </Box>
    </NERDrawer>
  );
};

export default Sidebar;
