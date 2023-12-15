/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { fullNamePipe } from '../../utils/pipes';
import NavUserMenu from './NavUserMenu';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/system';

const NavTopBar: React.FC = () => {
  const theme = useTheme();
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  });
  const user = useCurrentUser();
  return (
    <>
      <Box display="flex" flexDirection={'row'} marginLeft={'auto'} marginBottom={1} width={'auto'}>
        <Typography
          variant="body1"
          marginY={0.5}
          marginLeft={'auto'}
          marginRight={1}
          sx={{
            color: theme.palette.text.primary
          }}
        >
          {width < 600 ? '' : fullNamePipe(user)}
        </Typography>
        <NavUserMenu />
      </Box>
    </>
  );
};

export default NavTopBar;
