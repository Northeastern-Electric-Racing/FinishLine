/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { fullNamePipe } from '../../utils/pipes';
import NavUserMenu from './NavUserMenu';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';

const TEXT_COLOR = 'white';

const NavTopBar: React.FC = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  });
  const user = useCurrentUser();
  return (
    <Toolbar disableGutters sx={{ height: 68, px: 1, background: 'transparent', color: 'white' }}>
      <Box display="flex" flexDirection={'row'} marginLeft={'auto'} marginRight={0}>
        <Typography
          variant="body1"
          marginTop={2}
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
      </Box>
    </Toolbar>
  );
};

export default NavTopBar;
