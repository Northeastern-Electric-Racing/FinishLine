/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography, Box, IconButton, Divider, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import GroupIcon from '@mui/icons-material/Group';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavPageLink from './NavPageLink';
import NERDrawer from '../../components/NERDrawer';
import NavUserMenu from '../PageTitle/NavUserMenu';
import DrawerHeader from '../../components/DrawerHeader';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useHomePageContext } from '../../app/HomePageContext';
import SidebarButton from './SidebarButton';
import { useHistory } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../../pages/ErrorPage';

interface SidebarProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  moveContent: boolean;
  setMoveContent: (move: boolean) => void;
}

const Sidebar = ({ drawerOpen, setDrawerOpen, moveContent, setMoveContent }: SidebarProps) => {
  const { onPNMHomePage } = useHomePageContext();
  const user = useCurrentUser();
  const theme = useTheme();
  const history = useHistory();

  const memberLinkItems: LinkItem[] = [
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

  const pnmLinkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <HomeIcon />,
      route: routes.HOME_PNM
    },
    {
      name: 'Teams',
      icon: <GroupIcon />,
      route: routes.TEAMS
    }
  ];

  const linkItems = onPNMHomePage ? pnmLinkItems : memberLinkItems;

  const handleMoveContent = () => {
    if (moveContent) {
      setDrawerOpen(false);
    }
    setMoveContent(!moveContent);
  };

  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (!organization || organizationIsLoading) {
    return <LoadingIndicator />;
  }
  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  return (
    <NERDrawer
      open={drawerOpen}
      variant="permanent"
      onMouseLeave={() => {
        if (!moveContent) setDrawerOpen(false);
      }}
    >
      <DrawerHeader>
        <IconButton onClick={() => handleMoveContent()}>{moveContent ? <ChevronLeft /> : <ChevronRight />}</IconButton>
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
            <NavPageLink {...linkItem} />
          ))}
          {onPNMHomePage ? (
            // Apply button
            <SidebarButton
              onClick={() => window.open(organization.applicationLink, '_blank')}
              label={'Apply'}
              icon={<ArticleIcon sx={{ fontSize: 27 }} style={{ color: theme.palette.text.primary }} />}
            />
          ) : (
            <NavUserMenu open={drawerOpen} />
          )}
        </Box>
        <Box justifyContent={drawerOpen ? 'flex-start' : 'center'}>
          {isGuest(user.role) && (
            <Box marginBottom={2}>
              {/* Return to guest mode button */}
              <SidebarButton
                onClick={() => {
                  history.push(routes.HOME_GUEST);
                  window.location.reload();
                }}
                icon={<ArrowBackIcon sx={{ fontSize: 27 }} style={{ color: theme.palette.text.primary }} />}
                label={'Guest Home'}
              />
            </Box>
          )}
          <Box marginLeft={1.1}>
            <Typography marginLeft={1.1}>Sponsored By:</Typography>
            <Box component="img" sx={{ height: 40 }} alt="Kaleidoscope Logo" src="/kaleidoscope-logo-lockup.svg" />
          </Box>
          <Typography className={styles.versionNumber}>v5.0.0</Typography>
        </Box>
      </Box>
    </NERDrawer>
  );
};

export default Sidebar;
