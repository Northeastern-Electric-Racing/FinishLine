/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Import MUI icons
import HomeIcon from '@mui/icons-material/Home';
import GanttIcon from '@mui/icons-material/AlignHorizontalLeft';
import ProjectsIcon from '@mui/icons-material/Folder';
import ChangeRequestsIcon from '@mui/icons-material/SyncAlt';
import TeamsIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Typography } from '@mui/material';

const Sidebar: React.FC = () => {
  const linkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: HomeIcon,
      route: routes.HOME
    },
    {
      name: 'Gantt',
      icon: GanttIcon,
      route: routes.GANTT
    },
    {
      name: 'Projects',
      icon: ProjectsIcon,
      route: routes.PROJECTS
    },
    {
      name: 'Change Requests',
      icon: ChangeRequestsIcon,
      route: routes.CHANGE_REQUESTS
    },
    {
      name: 'Teams',
      icon: TeamsIcon,
      route: routes.TEAMS
    }
  ];

  linkItems.push({
    name: 'Info',
    icon: InfoIcon,
    route: routes.INFO
  });

  return (
    <div className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
      <Typography className={styles.versionNumber}>3.7.1</Typography>
    </div>
  );
};

export default Sidebar;
