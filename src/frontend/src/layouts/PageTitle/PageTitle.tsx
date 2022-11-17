/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid } from '@mui/material';
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
    <>
      <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
      <Grid container sx={{ mt: 1, mb: 2 }}>
        <Grid item>
          <Typography variant="h4" fontSize={30} sx={{ verticalAlign: 'middle', display: 'inline-flex' }}>
            {title}
          </Typography>
        </Grid>
        <Grid item sx={{ mx: 0 }} xs>
          <Grid container direction="row-reverse">
            <Grid item>{actionButton}</Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PageTitle;
