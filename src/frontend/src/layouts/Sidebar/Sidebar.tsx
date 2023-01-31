/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  faExchangeAlt,
  faFolder,
  faHome,
  faQuestionCircle,
  faToolbox,
  faUsers,
  faChartGantt
} from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { useAuth } from '../../hooks/auth.hooks';
import { Typography } from '@mui/material';
import { useGetVersionNumber } from '../../hooks/misc.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../../pages/ErrorPage';

const Sidebar: React.FC = () => {
  const auth = useAuth();
  const { isLoading, isError, error, data } = useGetVersionNumber();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const linkItems: LinkItem[] = [
    {
      name: 'Home',
      icon: faHome,
      route: routes.HOME
    },
    {
      name: 'Gantt',
      icon: faChartGantt,
      route: routes.GANTT
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
    }
  ];

  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'APP_ADMIN') {
    linkItems.push({
      name: 'Admin Tools',
      icon: faToolbox,
      route: routes.ADMIN_TOOLS
    });
  }

  linkItems.push({
    name: 'Info',
    icon: faQuestionCircle,
    route: routes.INFO
  });

  return (
    <div className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
      <Typography className={styles.versionNumber}>{data.tag_name}</Typography>
    </div>
  );
};

export default Sidebar;
