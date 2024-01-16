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
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { canAccessAdminTools } from '../../utils/users';
import { Stack, useTheme } from '@mui/system';
import { Typography } from '@mui/material';

interface NavUserMenuProps {
  open?: boolean;
}

const NavUserMenu: React.FC<NavUserMenuProps> = ({ open }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const history = useHistory();
  const auth = useAuth();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const googleAuthClientId = import.meta.env.VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID;

  const logout = () => {
    if (!auth) return;
    auth.signout();
    history.push(routes.HOME);
  };

  const ProdLogout = () => (
    <GoogleLogout
      clientId={googleAuthClientId!}
      //jsSrc={'accounts.google.com/gsi/client'}
      onLogoutSuccess={logout}
      render={(renderProps) => (
        <MenuItem component="div" sx={{ py: 0 }} onClick={renderProps.onClick} disabled={renderProps.disabled}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      )}
    />
  );

  const DevLogout = () => (
    <MenuItem onClick={logout} sx={{ py: 0 }}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Logout</ListItemText>
    </MenuItem>
  );

  const AdminTools = () => (
    <MenuItem component={RouterLink} to={routes.ADMIN_TOOLS} onClick={handleClose} sx={{ py: 0 }}>
      <ListItemIcon>
        <HomeRepairServiceIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Admin Tools</ListItemText>
    </MenuItem>
  );

  const theme = useTheme();

  return (
    <Stack direction={'row'} justifyContent={open ? 'flex-start' : 'center'}>
      <IconButton
        size="small"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color={theme.palette.text.primary}
        sx={{ padding: 0.5, marginLeft: open ? 1.1 : 0 }}
        style={{ borderRadius: 0 }}
      >
        <SettingsIcon sx={{ fontSize: 30 }} />
        {open && (
          <Typography
            variant="body1"
            marginBottom={0.2}
            marginLeft={1}
            sx={{
              color: theme.palette.text.primary
            }}
          >
            My Account
          </Typography>
        )}
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
            transform: open ? 'translateX(60%) translateY(0%)' : 'translateX(20%) translateY(0%)'
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
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        {canAccessAdminTools(auth.user) && <AdminTools />}
        {import.meta.env.MODE === 'development' ? <DevLogout /> : <ProdLogout />}
      </Menu>
    </Stack>
  );
};

export default NavUserMenu;
