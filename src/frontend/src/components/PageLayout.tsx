import { Container } from '@mui/material';
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
      <Container maxWidth={false} sx={{ p: 1, mt: '4rem', ml: '85px' }}>
        {!hidePageTitle && title && previousPages && <PageTitle {...{ title, previousPages, actionButton, tabs }} />}
        {children}
      </Container>
    </React.Fragment>
  );
};

export default PageLayout;
