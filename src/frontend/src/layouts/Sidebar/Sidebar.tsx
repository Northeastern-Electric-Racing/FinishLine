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
import RateReviewIcon from '@mui/icons-material/RateReview';
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
import { getAllTeamTypes } from '../../apis/team-types.api';
import ConstructionIcon from '@mui/icons-material/Construction';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CodeIcon from '@mui/icons-material/Code';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useCurrentUser } from '../../hooks/users.hooks';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useEffect } from 'react';

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
  const [allTeams, setAllTeams] = useState<LinkItem[]>([]);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType } = {
      ConstructionIcon,
      CodeIcon,
      ElectricBoltIcon,
      WorkIcon
    };
    const Icon = icons[iconName];
    return Icon ? <Icon /> : undefined;
  };

  useEffect(() => {
    getAllTeamTypes()
      .then((response) => {
        console.log('All teams from API:', response.data);
        setAllTeams(
          response.data.map((team: TeamType) => ({
            name: team.name,
            icon: getIcon(team.iconName),
            route: routes.TEAMS + '/' + team.teamTypeId
          }))
        );
      })
      .catch((error) => {
        console.log("Teams couldn't load " + error);
      });
  }, []);

  const memberLinkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <HomeIcon />,
      route: onGuestHomePage ? routes.HOME_GUEST : routes.HOME
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
          route: routes.PROJECTS,
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
              name: 'Design Review',
              icon: <RateReviewIcon />,
              route: routes.CALENDAR
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
          subItems: allTeams
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
      route: routes.RETROSPECTIVE
    },
    {
      name: 'Info',
      icon: <QuestionMarkIcon />,
      route: routes.INFO
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
            <NavPageLink
              {...linkItem}
              isSubmenuOpen={openSubmenu === linkItem.name}
              onSubmenuHover={() => handleOpenSubmenu(linkItem.name)}
              onSubmenuCollapse={() => handleCloseSubmenu()}
            />
          ))}
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
