/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Nav } from 'react-bootstrap';
import { faExchangeAlt, faFolder, faHome, faQuestionCircle, faUsers, faChartGantt } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/Routes';
import { LinkItem } from '../../utils/Types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';

const Sidebar: React.FC = () => {
  const linkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: faHome,
      route: routes.HOME
    },
    {
      name: 'Projects',
      icon: faFolder,
      route: routes.PROJECTS
    },
    {
      name: 'Change Requests',
      icon: faExchangeAlt,
      route: routes.CHANGE_REQUESTS
    },
    {
      name: 'Gantt',
      icon: faChartGantt,
      route: routes.GANTT
    },
    {
      name: 'Teams',
      icon: faUsers,
      route: routes.TEAMS
    },
    {
      name: 'Info',
      icon: faQuestionCircle,
      route: routes.INFO
    }
  ];
  return (
    <Nav className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
    </Nav>
  );
};

export default Sidebar;
