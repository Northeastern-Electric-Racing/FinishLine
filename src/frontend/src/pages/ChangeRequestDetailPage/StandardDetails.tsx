/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import React from 'react';
import { StandardChangeRequest } from 'shared';
import InfoBlock from '../../components/InfoBlock';
import { Box } from '@mui/material';

interface StandardDetailsProps {
  cr: StandardChangeRequest;
}

const StandardDetails: React.FC<StandardDetailsProps> = ({ cr }: StandardDetailsProps) => {
  return (
    <Box>
      <Box my={1}>
        <InfoBlock title={'Why'}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{cr.why}</Typography>
        </InfoBlock>
      </Box>
    </Box>
  );
};

export default StandardDetails;
