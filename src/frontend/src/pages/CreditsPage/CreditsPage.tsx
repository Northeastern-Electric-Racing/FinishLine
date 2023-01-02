/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Box, Button } from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import { useState } from 'react';

const CreditsPage: React.FC = () => {
  const names = ['Kevin Chen']; // This is a list of names, add yours here!

  const [displaySnark, SetDisplaySnark] = useState(false);

  return (
    <PageBlock>
      <PageTitle title={'CREDITS'} previousPages={[]} />
      <Grid container spacing={2}>
        {names?.map((name) => (
          <Grid item>
            <Box>{name}</Box>
          </Grid>
        ))}
      </Grid>

      <Button
        sx={{
          bottom: '10%',
          left: '45%',
          position: 'absolute'
        }}
        onClick={() => SetDisplaySnark(true)}
        onMouseLeave={() => SetDisplaySnark(false)}
        variant="contained"
      >
        {displaySnark ? "Shouldn't you do it yourself?" : 'Add your name!'}
      </Button>
    </PageBlock>
  );
};

export default CreditsPage;
