/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { useAuth } from '../../hooks/auth.hooks';
import { Home, Description, Folder, SwapHoriz, Group, Timeline } from '@mui/icons-material';
import { Typography } from '@mui/material';

const Sidebar: React.FC = () => {
  const linkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: <Home />,
      route: routes.HOME
    },
    {
      name: 'Gantt',
      icon: <Timeline />,
      route: routes.GANTT
    },
    {
      name: 'Projects',
      icon: <Folder />,
      route: routes.PROJECTS
    },
    {
      name: 'Change Requests',
      icon: <SwapHoriz />,
      route: routes.CHANGE_REQUESTS
    },
    {
      name: 'Teams',
      icon: <Group />,
      route: routes.TEAMS
    }
  ];


  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'APP_ADMIN') {
    linkItems.push({
      name: 'Admin Tools',
      icon: <Description />,
      route: routes.ADMIN_TOOLS
    });
  }
  
  linkItems.push({
    name: 'Info',
    icon: <Description />,
    route: routes.INFO
  });

  return (
    <div className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
      <Typography className={styles.versionNumber}>3.7.0</Typography>
    </div>
  );
};

export default Sidebar;
