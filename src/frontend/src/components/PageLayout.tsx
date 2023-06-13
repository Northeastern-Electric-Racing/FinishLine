import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet';
import NavTopBar from '../layouts/NavTopBar/NavTopBar';
import Sidebar from '../layouts/Sidebar/Sidebar';
import React, { ReactNode, ReactElement } from 'react';
import PageTitle from '../layouts/PageTitle/PageTitle';
import { LinkItem } from '../utils/types';

interface PageLayoutProps {
  title?: string;
  hidePageTitle?: boolean;
  previousPages?: LinkItem[];
  actionButton?: ReactNode;
  tabs?: ReactElement;
}
// TODO: Fix horizontal scrolling bug

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  hidePageTitle = false,
  previousPages = [],
  actionButton,
  tabs
}) => {
  return (
    <React.Fragment>
      <Helmet>
        <title>{`FinishLine ${title && `| ${title}`}`}</title>
        <meta name="description" content="FinishLine Project Management Dashboard" />
      </Helmet>
      <NavTopBar />
      <Sidebar />
      <Box sx={{ mt: '4rem', ml: '85px' }}>
        <Container maxWidth={false} sx={{ p: 1 }}>
          {!hidePageTitle && title && previousPages && <PageTitle {...{ title, previousPages, actionButton, tabs }} />}
          {children}
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default PageLayout;
