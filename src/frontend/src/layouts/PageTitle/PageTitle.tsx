/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Box, Grid, useTheme } from '@mui/material';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { LinkItem } from '../../utils/types';
import PageBreadcrumbs from './PageBreadcrumbs';
import NavUserMenu from './NavUserMenu';
import { fullNamePipe } from '../../utils/pipes';
import { useCurrentUser } from '../../hooks/users.hooks';

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
  const user = useCurrentUser();
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  });

  return (
    <>
      <Box mb={sticky ? -1 : 0}>
        <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
      </Box>
      <Box
        mb={2}
        position={sticky ? 'sticky' : 'initial'}
        top={65}
        pt={sticky ? 1 : 0}
        zIndex={1}
        bgcolor={theme.palette.background.default}
      >
        <Grid container>
          <Grid item xs={6} md={8}>
            <Typography variant="h4" fontSize={30}>
              {title}
            </Typography>
          </Grid>
          <Grid item xs={6} md={4} textAlign={'right'}>
            <Box display="flex" flexDirection={'row'} marginLeft={'auto'} marginBottom={1} width={'auto'}>
              <Typography
                variant="body1"
                marginY={0.5}
                marginLeft={'auto'}
                marginRight={1}
                sx={{
                  color: theme.palette.text.primary
                }}
              >
                {width < 600 ? '' : fullNamePipe(user)}
              </Typography>
              <NavUserMenu />
            </Box>
            {headerRight}
          </Grid>
        </Grid>
        {tabs && <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>{tabs}</Box>}
      </Box>
    </>
  );
};

export default PageTitle;
