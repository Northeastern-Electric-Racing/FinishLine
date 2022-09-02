/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { GoogleLogout } from 'react-google-login';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../hooks/Auth.hooks';
import { routes } from '../../utils/Routes';
import Button from '@mui/material/Button';

const NavUserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const history = useHistory();
  const auth = useAuth();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          divider
          component="p"
          style={{ backgroundColor: 'transparent' }}
          sx={{ cursor: 'default' }}
        >
          {auth.user?.email}
        </MenuItem>
        <MenuItem component={RouterLink} to={routes.SETTINGS} onClick={handleClose}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID!}
            //jsSrc={'accounts.google.com/gsi/client'}
            onLogoutSuccess={() => {
              auth!.signout();
              history.push(routes.HOME);
            }}
            render={(renderProps) => (
              <Button onClick={renderProps.onClick} disabled={renderProps.disabled}>
                Logout
              </Button>
            )}
          ></GoogleLogout>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NavUserMenu;
