/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid, Box, useTheme } from '@mui/material';
import { ReactElement, ReactNode } from 'react';
import { LinkItem } from '../../utils/types';
import PageBreadcrumbs from './PageBreadcrumbs';

interface PageTitleProps {
  title: string;
  previousPages: LinkItem[];
  headerRight?: ReactNode;
  tabs?: ReactElement;
}

/**
 * Build the page title section for a page.
 * @param title The title of the page
 * @param previousPages The pages in the breadcrumb between home and the current page
 * @param headerRight The button to display on the right side of the page title
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, previousPages, headerRight, tabs }) => {
  const theme = useTheme();

  return (
    <>
      <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
      <Grid container sx={{ mb: 2 }} alignItems="center">
        <Grid item>
          <Typography variant="h4" fontSize={30} sx={{ verticalAlign: 'middle', display: 'inline-flex' }}>
            {title}
          </Typography>
        </Grid>
        <Grid
          item
          lg={'auto'}
          xs={12}
          sx={{
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 16px',
            maxWidth: '100%',
            mb: theme.breakpoints.down('xs') ? 2 : 0
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>{tabs}</Box>
        </Grid>
        <Grid item sx={{ mx: 0 }}>
          {headerRight}
        </Grid>
      </Grid>
    </>
  );
};

export default PageTitle;
