import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet';
import NavTopBar from '../layouts/NavTopBar/NavTopBar';
import Sidebar from '../layouts/Sidebar/Sidebar';
import React, { ReactNode, ReactElement, Fragment } from 'react';
import PageTitle from '../layouts/PageTitle/PageTitle';
import { MUILinkItem } from '../utils/types';

interface PageLayoutProps {
  title?: string;
  hidePageTitle?: boolean;
  previousPages?: MUILinkItem[];
  headerRight?: ReactNode;
  tabs?: ReactElement;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  hidePageTitle = false,
  previousPages = [],
  headerRight,
  tabs
}) => {
  return (
    <Fragment>
      <Helmet>
        <title>{`FinishLine ${title && `| ${title}`}`}</title>
        <meta name="description" content="FinishLine Project Management Dashboard" />
      </Helmet>
      <NavTopBar />
      <Sidebar />
      <Box sx={{ mt: '4rem', ml: '200px' }}>
        <Container maxWidth={false} sx={{ p: 1 }}>
          {!hidePageTitle && title && <PageTitle {...{ title, previousPages, headerRight, tabs }} />}
          {children}
        </Container>
      </Box>
    </Fragment>
  );
};

export default PageLayout;
