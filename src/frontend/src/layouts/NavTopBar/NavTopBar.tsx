/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { routes } from '../../utils/Routes';
import { useAuth } from '../../hooks/Auth.hooks';
import { fullNamePipe } from '../../utils/Pipes';
import NavUserMenu from './NavUserMenu';

const textColor = 'white';
const background = '#ef4345';

const NavTopBar: React.FC = () => {
  const auth = useAuth();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar disableGutters sx={{ px: 1, background, color: textColor }}>
          <Box sx={{ flexGrow: 1 }}>
            <Link to={routes.HOME} style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box
                  component="img"
                  sx={{ height: 60 }}
                  alt="Northeastern Electric Racing Logo"
                  src="/NER-Logo-App-Icon.png"
                />
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ flexGrow: 1, paddingLeft: 2, color: textColor }}
                >
                  FinishLine by NER
                </Typography>
              </Box>
            </Link>
          </Box>
          <Typography variant="body1" component="div" sx={{ color: textColor }}>
            {fullNamePipe(auth.user)}
          </Typography>
          <NavUserMenu />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavTopBar;
