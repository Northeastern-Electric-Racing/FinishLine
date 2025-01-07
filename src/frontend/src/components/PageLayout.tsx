/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Helmet } from 'react-helmet';
import React, { ReactNode, ReactElement } from 'react';
import PageTitle from '../layouts/PageTitle/PageTitle';
import { LinkItem } from '../utils/types';
import { Box } from '@mui/system';
import PageBreadcrumbs from '../layouts/PageTitle/PageBreadcrumbs';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  chips?: ReactNode;
  hidePageTitle?: boolean;
  previousPages?: LinkItem[];
  headerRight?: ReactNode;
  tabs?: ReactElement;
  stickyHeader?: boolean;
}

export const PAGE_GRID_HEIGHT = 85;

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
        <>
          <Box mb={-1}>
            <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
          </Box>
          <PageTitle sticky={stickyHeader} {...{ title, chips, headerRight, tabs }} />
        </>
      )}
      {children}
    </Box>
  );
};

export default PageLayout;
