/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/system';
import { Container, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
import Sidebar from './Sidebar/Sidebar';
import HiddenContentMargin from '../components/HiddenContentMargin';
import { useHomePageContext } from '../app/HomePageContext';

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moveContent, setMoveContent] = useState(false);
  const { onGuestHomePage } = useHomePageContext();

  return (
    <>
      <Box
        onMouseEnter={() => {
          setDrawerOpen(true);
        }}
        sx={{
          height: '100vh',
          position: 'fixed',
          width: 15,
          borderRight: 2,
          borderRightColor: theme.palette.background.paper
        }}
      />
      <IconButton
        onClick={() => {
          setDrawerOpen(true);
          if (!isMobile) setMoveContent(true);
        }}
        sx={{ position: 'fixed', left: -8, top: '3%' }}
        id="sidebar-button"
      >
        <ArrowCircleRightTwoToneIcon
          sx={{
            fontSize: '30px',
            zIndex: 1,
            '& path:first-of-type': { color: '#000000' },
            '& path:last-of-type': { color: '#ef4345' }
          }}
        />
      </IconButton>
      <Sidebar
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        moveContent={moveContent}
        setMoveContent={setMoveContent}
      />
      <Box display={'flex'}>
        <HiddenContentMargin open={moveContent} variant="permanent" />
        <Container
          maxWidth={false}
          sx={{ width: onGuestHomePage && moveContent ? 'calc(100vw - 220px)' : `calc(100vw - 30px)` }}
        >
          {children}
        </Container>
      </Box>
    </>
  );
};

export default SidebarLayout;
