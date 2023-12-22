/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';

import { ChangeRequestExplanation, StandardChangeRequest } from 'shared';
import InfoBlock from '../../components/InfoBlock';
import { Box } from '@mui/material';

interface StandardDetailsProps {
  cr: StandardChangeRequest;
}
const style = {
  maxWidth: '140px',
  fontWeight: 'bold'
};
const StandardDetails: React.FC<StandardDetailsProps> = ({ cr }: StandardDetailsProps) => {
  return (
    <Grid container spacing={1}>
      <InfoBlock title={'What'}>
        <Typography>{cr.what}</Typography>
      </InfoBlock>
      <InfoBlock title="Why">
        {cr.why.map((ele: ChangeRequestExplanation, idx: number) => (
          <Box key={'CRExplanation' + idx} display="flex">
            <Typography sx={style}>{ele.type + ' '}</Typography>
            <Typography sx={{ ml: '5px' }}>{' - ' + ele.explain}</Typography>
          </Box>
        ))}
      </InfoBlock>
    </Grid>
  );
};

export default StandardDetails;
