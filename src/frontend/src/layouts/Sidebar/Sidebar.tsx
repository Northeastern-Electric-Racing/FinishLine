/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Nav } from 'react-bootstrap';
import { faExchangeAlt, faFolder, faHome, faQuestionCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/Routes';
import { LinkItem } from '../../utils/Types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { Stack, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { Home, Folder, CompareArrows, Groups, Help } from '@mui/icons-material';

const Sidebar: React.FC = () => {
  // const linkItems: LinkItem[] = [
  //   {
  //     name: 'Home',
  //     icon: faHome,
  //     route: routes.HOME
  //   },
  //   {
  //     name: 'Projects',
  //     icon: faFolder,
  //     route: routes.PROJECTS
  //   },
  //   {
  //     name: 'Change Requests',
  //     icon: faExchangeAlt,
  //     route: routes.CHANGE_REQUESTS
  //   },
  //   {
  //     name: 'Teams',
  //     icon: faUsers,
  //     route: routes.TEAMS
  //   },
  //   {
  //     name: 'Info',
  //     icon: faQuestionCircle,
  //     route: routes.INFO
  //   }
  // ];
  const auth = useAuth();
  const backgroundColor = '#282828';
  // const useStyles = makeStyles({
  //   flexGrow: {
  //     flex: '1'
  //   },
  //   button: {
  //     '&:hover': {
  //       backgroundColor: '#fff',
  //       color: '#3c52b2'
  //     }
  //   }
  // });
  // const classes = useStyles;

  return (
    <Stack spacing={2} className={styles.sidebar}>
      <Button
        style={{
          textTransform: 'none',
          fontSize: 14,
          backgroundColor: backgroundColor,
          borderColor: '#ffffff',
          boxShadow: 'none',
          flexDirection: 'column'
        }}
        variant="contained"
        sx={{
          ':hover': {
            bgcolor: 'blue', // theme.palette.primary.main
            color: 'red'
          },
          color: 'white'
        }}
        component={Link}
        to={routes.HOME}
        disabled={auth.user?.role === 'GUEST'}
        startIcon={<Home sx={{ color: 'white', fontSize: 30, ':hover': { color: 'red' } }} />}
      >
        Home
      </Button>

      <Button
        style={{
          textTransform: 'none',
          fontSize: 14,
          backgroundColor: backgroundColor,
          borderColor: '#ffffff',
          boxShadow: 'none',
          flexDirection: 'column'
        }}
        variant="contained"
        sx={{ color: 'white' }}
        component={Link}
        to={routes.PROJECTS}
        disabled={auth.user?.role === 'GUEST'}
        startIcon={<Folder style={{ color: 'white' }} />}
      >
        Projects
      </Button>

      <Button
        style={{
          textTransform: 'none',
          fontSize: 14,
          backgroundColor: backgroundColor,
          borderColor: '#ffffff',
          boxShadow: 'none',
          flexDirection: 'column'
        }}
        variant="contained"
        sx={{ color: 'white' }}
        component={Link}
        to={routes.CHANGE_REQUESTS}
        disabled={auth.user?.role === 'GUEST'}
        startIcon={<CompareArrows style={{ color: 'white' }} />}
      >
        Change Requests
      </Button>

      <Button
        style={{
          textTransform: 'none',
          fontSize: 14,
          backgroundColor: backgroundColor,
          borderColor: '#ffffff',
          boxShadow: 'none',
          flexDirection: 'column'
        }}
        variant="contained"
        sx={{ color: 'white' }}
        component={Link}
        to={routes.TEAMS}
        disabled={auth.user?.role === 'GUEST'}
        startIcon={<Groups style={{ color: 'white' }} />}
      >
        Teams
      </Button>

      <Button
        style={{
          textTransform: 'none',
          fontSize: 14,
          backgroundColor: backgroundColor,
          borderColor: '#ffffff',
          boxShadow: 'none',
          flexDirection: 'column'
        }}
        variant="contained"
        sx={{ color: 'white' }}
        component={Link}
        to={routes.INFO}
        disabled={auth.user?.role === 'GUEST'}
        startIcon={<Help style={{ color: 'white' }} />}
      >
        Info
      </Button>
    </Stack>
  );
};

export default Sidebar;
