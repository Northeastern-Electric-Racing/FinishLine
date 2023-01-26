/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { GoogleLogout } from 'react-google-login';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import Button from '@mui/material/Button';

const NavUserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const history = useHistory();
  const auth = useAuth();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const googleAuthClientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;

  const logout = () => {
    auth!.signout();
    history.push(routes.HOME);
  };

  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle sx={{ fontSize: 36 }} />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          style: {
            transform: 'translateX(-10%) translateY(35%)'
          }
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        sx={{ minHeight: 0 }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          divider
          component="p"
          style={{ backgroundColor: 'transparent' }}
          sx={{ fontWeight: 600, cursor: 'default' }}
        >
          {auth.user?.email}
        </MenuItem>
        <MenuItem component={RouterLink} to={routes.SETTINGS} onClick={handleClose} sx={{ py: 0 }}>
          Settings
        </MenuItem>
        {googleAuthClientId ? (
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID!}
            //jsSrc={'accounts.google.com/gsi/client'}
            onLogoutSuccess={logout}
            render={(renderProps) => (
              <MenuItem component="div" sx={{ py: 0 }}>
                Logout
              </MenuItem>
            )}
          />
        ) : (
          <MenuItem onClick={logout} component="div" sx={{ py: 0 }}>
            <Button sx={{ padding: 0, minHeight: 0, minWidth: 0 }}>Logout</Button>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NavUserMenu;
