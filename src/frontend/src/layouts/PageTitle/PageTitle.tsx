/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Box, Grid, useTheme } from '@mui/material';
import { ReactElement, ReactNode } from 'react';
import { LinkItem } from '../../utils/types';
import PageBreadcrumbs from './PageBreadcrumbs';

interface PageTitleProps {
  title: string;
  previousPages: LinkItem[];
  headerRight?: ReactNode;
  tabs?: ReactElement;
  sticky?: boolean;
}

/**
 * Build the page title section for a page.
 * @param title The title of the page
 * @param previousPages The pages in the breadcrumb between home and the current page
 * @param headerRight The button to display on the right side of the page title
 * @param tabs The tabs on the page to display.
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, previousPages, headerRight, tabs, sticky }) => {
  const theme = useTheme();

  return (
    <>
      <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
      <Box sx={{ mb: 2 }}>
        <Grid container rowSpacing={1}>
          <Grid item xs={6} md={4}>
            <Typography variant="h4" fontSize={30}>
              {title}
            </Typography>
          </Grid>
          <Grid item xs={0} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            {tabs}
          </Grid>
          <Grid item xs={6} md={4} textAlign={['left', 'right']}>
            {headerRight}
          </Grid>
          <Grid item xs={12} md={0} justifyContent={'center'} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {tabs}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PageTitle;
