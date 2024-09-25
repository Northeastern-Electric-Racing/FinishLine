/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { ChangeRequest } from 'shared/src/types/change-request-types';
import ChangeRequestDetailCard from './ChangeRequestDetailCard';

interface ChangeRequestRowProps {
  title: string;
  changeRequests: ChangeRequest[];
  noChangeRequestsMessage: string;
  flexWrap?: string;
}

const ChangeRequestRow: React.FC<ChangeRequestRowProps> = ({ title, changeRequests, noChangeRequestsMessage, flexWrap }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {changeRequests.length > 0 ? (
        <Grid container>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: flexWrap ? flexWrap : 'wrap',
              overflow: 'auto',
              justifyContent: 'flex-start',
              '&::-webkit-scrollbar': {
                height: '20px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.divider,
                borderRadius: '20px',
                border: '6px solid transparent',
                backgroundClip: 'content-box'
              }
            }}
            data-testid={title + 'crRow'}
          >
            {changeRequests.map((cr: ChangeRequest) => (
              <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
            ))}
          </Box>
        </Grid>
      ) : (
        <Typography gutterBottom>{noChangeRequestsMessage}</Typography>
      )}
    </Box>
  );
};
export default ChangeRequestRow;
