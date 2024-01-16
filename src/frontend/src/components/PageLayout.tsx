/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Helmet } from 'react-helmet';
import React, { ReactNode, ReactElement } from 'react';
import PageTitle from '../layouts/PageTitle/PageTitle';
import { LinkItem } from '../utils/types';
import { Box } from '@mui/system';

interface PageLayoutProps {
  title?: string;
  chips?: ReactNode;
  hidePageTitle?: boolean;
  previousPages?: LinkItem[];
  headerRight?: ReactNode;
  tabs?: ReactElement;
  stickyHeader?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  chips,
  hidePageTitle = false,
  previousPages = [],
  headerRight,
  tabs,
  stickyHeader
}) => {
  return (
    <Box>
      <Helmet>
        <title>{`FinishLine ${title && `| ${title}`}`}</title>
        <meta name="description" content="FinishLine Project Management Dashboard" />
      </Helmet>
      {!hidePageTitle && title && (
        <PageTitle sticky={stickyHeader} {...{ title, chips, previousPages, headerRight, tabs }} />
      )}
      {children}
    </Box>
  );
};

export default PageLayout;
