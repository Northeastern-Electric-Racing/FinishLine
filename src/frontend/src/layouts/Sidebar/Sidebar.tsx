/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routes } from '../../utils/routes';
import { MUILinkItem } from '../../utils/types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography } from '@mui/material';
// Material UI Icons
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import GroupIcon from '@mui/icons-material/Group';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { useAuth } from '../../hooks/auth.hooks';

const Sidebar: React.FC = () => {
  const auth = useAuth();

  const linkItems: MUILinkItem[] = [
    {
      name: 'Home',
      icon: HomeIcon,
      route: routes.HOME
    },
    {
      name: 'Gantt',
      icon: BarChartIcon,
      route: routes.GANTT
    },
    {
      name: 'Projects',
      icon: FolderIcon,
      route: routes.PROJECTS
    },
    {
      name: 'Change Requests',
      icon: SyncAltIcon,
      route: routes.CHANGE_REQUESTS
    },
    {
      name: 'Teams',
      icon: GroupIcon,
      route: routes.TEAMS
    }
  ];

  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'APP_ADMIN') {
    linkItems.push({
      name: 'Admin Tools',
      icon: HomeRepairServiceIcon,
      route: routes.ADMIN_TOOLS
    });
  }

  linkItems.push({
    name: 'Info',
    icon: QuestionMarkIcon,
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
