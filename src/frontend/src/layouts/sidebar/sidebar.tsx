/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Nav } from 'react-bootstrap';
import {
  faExchangeAlt,
  faFolder,
  faHome,
  faQuestionCircle,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../routes';
import { LinkItem } from '../../types';
import NavPageLinks from './nav-page-links/nav-page-links';
import styles from './sidebar.module.css';

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
      name: 'Teams',
      icon: faUsers,
      route: routes.TEAMS
    },
    {
      name: 'Help',
      icon: faQuestionCircle,
      route: routes.HELP
    }
  ];
  return (
    <Nav className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
    </Nav>
  );
};

export default Sidebar;
