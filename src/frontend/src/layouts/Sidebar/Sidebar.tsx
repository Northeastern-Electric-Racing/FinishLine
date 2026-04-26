/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography, Box, IconButton, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import GroupIcon from '@mui/icons-material/Group';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavPageLink from './NavPageLink';
import NERDrawer from '../../components/NERDrawer';
import NavUserMenu from '../PageTitle/NavUserMenu';
import DrawerHeader from '../../components/DrawerHeader';
import { Cached, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useHomePageContext } from '../../app/HomePageContext';
import { isGuest, TeamType } from 'shared';
import * as MuiIcons from '@mui/icons-material';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import ErrorPage from '../../pages/ErrorPage';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useCurrentUser } from '../../hooks/users.hooks';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import GlobalCarFilterHeader from '../../components/GlobalCarFilterHeader';
import GlobalCarFilterChips from '../../components/GlobalCarFilterChips';
import { CalendarIcon } from '@mui/x-date-pickers';

interface SidebarProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  moveContent: boolean;
  setMoveContent: (move: boolean) => void;
}

const Sidebar = ({ drawerOpen, setDrawerOpen, moveContent, setMoveContent }: SidebarProps) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { onPNMHomePage, onOnboardingHomePage } = useHomePageContext();
  const user = useCurrentUser();
  const { onGuestHomePage } = useHomePageContext();
  const { isError: teamsError, error: teamsErrorMsg, data: teams } = useAllTeamTypes();

  const allTeams: LinkItem[] = (teams ?? []).map((team: TeamType) => {
    const IconComponent = MuiIcons[(team.iconName in MuiIcons ? team.iconName : 'Circle') as keyof typeof MuiIcons];
    return {
      name: team.name,
      icon: <IconComponent />,
      route: routes.TEAMS + '/' + team.teamTypeId
    };
  });

  if (teamsError) return <ErrorPage error={teamsErrorMsg} />;
  const memberLinkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <HomeIcon />,
      route: routes.HOME
    },
    !onGuestHomePage && {
      name: 'Gantt',
      icon: <AlignHorizontalLeftIcon />,
      route: routes.GANTT
    },
    !onGuestHomePage
      ? {
          name: 'Projects',
          icon: <FolderIcon />,
          route: routes.PROJECTS
        }
      : {
          name: 'Project Management',
          icon: <DashboardIcon />,
          route: routes.PROJECT_MANAGEMENT,
          subItems: [
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
              name: 'Events',
              icon: <CalendarIcon />,
              route: routes.EVENTS
            }
          ]
        },
    !onGuestHomePage && {
      name: 'Change Requests',
      icon: <SyncAltIcon />,
      route: routes.CHANGE_REQUESTS
    },
    !onGuestHomePage && {
      name: 'Finance',
      icon: <AttachMoneyIcon />,
      route: routes.FINANCE,
      subItems: [
        {
          name: 'Finance Dashboard',
          icon: <QueryStatsIcon sx={{ fontSize: '20px' }} />,
          route: routes.FINANCE_DASHBOARD
        },
        {
          name: 'Reimbursements',
          icon: <CurrencyExchangeIcon sx={{ fontSize: '20px' }} />,
          route: routes.REIMBURSEMENT_REQUESTS
        },
        {
          name: 'Companies',
          icon: <ShoppingCartIcon sx={{ fontSize: '20px' }} />,
          route: routes.COMPANIES
        }
      ]
    },

    !onGuestHomePage
      ? {
          name: 'Teams',
          icon: <GroupIcon />,
          route: routes.TEAMS
        }
      : {
          name: 'Divisions',
          icon: <GroupIcon />,
          route: routes.TEAMS,
          subItems: allTeams,
          isClickableWithSubitems: true
        },
    !onGuestHomePage && {
      name: 'Calendar',
      icon: <CalendarTodayIcon />,
      route: routes.CALENDAR
    },
    !onGuestHomePage && {
      name: 'Retrospective',
      icon: <Cached />,
      route: routes.RETROSPECTIVE
    },
    onGuestHomePage && {
      name: 'Sponsors',
      icon: <VolunteerActivismIcon />,
      route: routes.SPONSORS
    },
    {
      name: 'Info',
      icon: <QuestionMarkIcon />,
      route: isGuest(user.role) ? routes.GUEST_INFO : routes.INFO
    }
  ].filter(Boolean) as LinkItem[];

  if (!isGuest(user.role) && !onGuestHomePage) {
    memberLinkItems.splice(6, 0, {
      name: 'Statistics',
      icon: <BarChartIcon />,
      route: routes.STATISTICS
    });
  }

  const onboardingLinkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <HomeIcon />,
      route: routes.HOME
    },
    {
      name: 'Teams',
      icon: <GroupIcon />,
      route: routes.TEAMS
    }
  ];

  const linkItems = onPNMHomePage || onOnboardingHomePage ? onboardingLinkItems : memberLinkItems;

  const handleMoveContent = () => {
    if (moveContent) {
      setDrawerOpen(false);
    }
    setMoveContent(!moveContent);
  };

  const handleOpenSubmenu = (name: string) => {
    setOpenSubmenu(name);
  };

  const handleCloseSubmenu = () => {
    setOpenSubmenu(null);
  };

  return (
    <NERDrawer
      open={drawerOpen}
      variant="permanent"
      onMouseLeave={() => {
        if (!moveContent) setDrawerOpen(false);
      }}
    >
      <DrawerHeader>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GlobalCarFilterHeader sx={{ flex: 1 }} />
            <IconButton onClick={() => handleMoveContent()} sx={{ p: 0.5 }}>
              {moveContent ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Box>
          <GlobalCarFilterChips />
        </Box>
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
            <NavPageLink
              key={linkItem.route}
              {...linkItem}
              isSubmenuOpen={openSubmenu === linkItem.name}
              onSubmenuHover={() => handleOpenSubmenu(linkItem.name)}
              onSubmenuCollapse={() => handleCloseSubmenu()}
            />
          ))}
          <Divider sx={{ mx: 1, my: 2 }} />
          <NavUserMenu open={drawerOpen} />
        </Box>
        <Box justifyContent={drawerOpen ? 'flex-start' : 'center'}>
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
