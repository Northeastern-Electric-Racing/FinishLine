/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { LinkItem } from '../../utils/Types';
import PageBreadcrumbs from './PageBreadcrumbs';

interface PageTitleProps {
  title: string;
  previousPages: LinkItem[];
  actionButton?: ReactNode;
}

/**
 * Build the page title section for a page.
 * @param title The title of the page
 * @param previousPages The pages in the breadcrumb between home and the current page
 * @param actionButton The button to display on the right side of the page title
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, previousPages, actionButton }) => {
  return (
    <div>
      <div>
        <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Typography variant="h4" fontSize={30} sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {actionButton}
        </Box>
      </div>
    </div>
  );
};

export default PageTitle;
