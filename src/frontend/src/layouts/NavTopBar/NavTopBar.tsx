/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { fullNamePipe } from '../../utils/pipes';
import NavUserMenu from './NavUserMenu';
import NERAppBar from '../../components/NERAppBar';
import { LayoutProps } from '../LayoutProps';
import { IconButton } from '@mui/material';
import { GridMenuIcon } from '@mui/x-data-grid';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect, useState } from 'react';

const TEXT_COLOR = 'white';
const BACKGROUND = '#ef4345';
const MOBILE_WIDTH_THRESHOLD = 550;

interface NavTopBarProps extends LayoutProps {
  handleDrawerOpen: () => void;
}

const NavTopBar: React.FC<NavTopBarProps> = ({ open, handleDrawerOpen }) => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  });
  const user = useCurrentUser();
  return (
    <NERAppBar position="fixed" open={open}>
      <Toolbar disableGutters sx={{ height: 68, px: 1, background: BACKGROUND, color: TEXT_COLOR }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          sx={{
            marginRight: 4,
            ml: '3px',
            ...(open && { display: 'none' })
          }}
        >
          <GridMenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Link to={routes.HOME} style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                component="img"
                sx={{ height: 60 }}
                alt="Northeastern Electric Racing Logo"
                src="/NER-Logo-App-Icon.png"
              />
              <Typography variant="h4" fontSize={30} component="div" sx={{ flexGrow: 1, paddingLeft: 2, color: TEXT_COLOR }}>
                {width > MOBILE_WIDTH_THRESHOLD ? 'FinishLine by NER' : 'FinishLine'}
              </Typography>
            </Box>
          </Link>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: TEXT_COLOR,
            '@media (max-width: 600px)': {
              display: 'none' // Hide the text on screens with width less than 600 pixels
            }
          }}
        >
          {fullNamePipe(user)}
        </Typography>
        <NavUserMenu />
      </Toolbar>
    </NERAppBar>
  );
};

export default NavTopBar;
