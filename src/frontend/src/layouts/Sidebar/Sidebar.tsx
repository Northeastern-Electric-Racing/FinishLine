/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import {
  faExchangeAlt,
  faFolder,
  faHome,
  faQuestionCircle,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/Routes';
import { LinkItem } from '../../utils/Types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { getReleaseInfo } from '../../apis/misc.api';

const Sidebar: React.FC = () => {
  const [versionNumber, setVersionNumber] = useState('');

  useEffect(() => {
    getReleaseInfo().then((response) => setVersionNumber(response.data.tag_name));
  }, []);

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
      name: 'Info',
      icon: faQuestionCircle,
      route: routes.INFO
    }
  ];
  return (
    <Nav className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
      <p className={styles.versionNumber}>{versionNumber}</p>
    </Nav>
  );
};

export default Sidebar;
