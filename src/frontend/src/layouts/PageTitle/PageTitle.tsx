/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Box, Grid } from '@mui/material';
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
 * @param chips Oval next to the title
 **/
const PageTitle: React.FC<PageTitleProps> = ({ title, headerRight, tabs, sticky, chips }) => {
  return (
    <>
      <Box
        mb={2}
        position={sticky ? 'sticky' : 'initial'}
        top={sticky ? 0 : 65}
        pt={sticky ? 1 : 0}
        pb={sticky ? 1 : 0}
        zIndex={1}
        marginTop={2}
      >
        <Grid container>
          <Grid container item md={12} display="flex" alignItems={'center'}>
            <Grid md={7} xs={12} display="flex">
              <Typography flexGrow={1} variant="h4" fontSize={30}>
                {title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }} flexGrow={4}>
                {chips}
              </Box>
            </Grid>
            <Grid item md={5} xs={12}>
              <Box textAlign={['left', 'right']}>{headerRight}</Box>
            </Grid>
          </Grid>
          {tabs}
        </Grid>
      </Box>
    </>
  );
};

export default PageTitle;
