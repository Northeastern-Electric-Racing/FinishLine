/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Box, Grid, useTheme } from '@mui/material';
import { ReactElement, ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  chips?: ReactNode;
  headerRight?: ReactNode;
  tabs?: ReactElement;
  sticky?: boolean;
}

/**
 * Build the page title section for a page.
 * @param title The title of the page
 * @param headerRight The button to display on the right side of the page title
 * @param tabs The tabs on the page to display.
 * @param sticky whether or not the header should be sticky
 * @param chips chips
 **/
const PageTitle: React.FC<PageTitleProps> = ({ title, headerRight, tabs, sticky, chips }) => {
  const theme = useTheme();

  return (
    <>
      <Box
        mb={2}
        position={sticky ? 'sticky' : 'initial'}
        top={sticky ? 0 : 65}
        pt={sticky ? 1 : 0}
        pb={sticky ? 1 : 0}
        zIndex={1}
        bgcolor={theme.palette.background.default}
        marginTop={2}
      >
        <Grid container>
          <Grid container item xs={12} display="flex" alignItems={'center'}>
            <Grid item xs={6}>
              <Typography variant="h4" fontSize={30}>
                {title}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign={['left', 'right']}>{headerRight}</Box>
            </Grid>
          </Grid>
          <Grid container item xs={12} display="flex" alignItems={'center'}>
            <Grid item xs={8}>
              {tabs}
            </Grid>
            <Grid item xs={4}>
              {
                chips //I'm ngl I don't actually know what chips are but they go here now
              }
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PageTitle;
