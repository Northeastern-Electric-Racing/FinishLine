/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faExchangeAlt, faFolder, faHome, faQuestionCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
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
    <div className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
    </div>
  );
};

export default Sidebar;
