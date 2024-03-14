/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { ChangeRequest, changeRequests } from 'shared/src/types/change-request-types';
import ChangeRequestDetailCard from './ChangeRequestDetailCard';

const ChangeRequestRow = ({ cr }: { cr: changeRequests }) => {
  const theme = useTheme();

  const displayCRCards = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  const renderChangeRequests = (title: string, crList: ChangeRequest[], emptyMessage: string) => {
    return (
      <>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {crList.length > 0 ? (
          <Grid container>{displayCRCards(crList)}</Grid>
        ) : (
          <Typography gutterBottom>{emptyMessage}</Typography>
        )}
      </>
    );
  };

  return (
    <>
      <Box>{renderChangeRequests(cr.title, cr.crList, cr.noChangeRequestsMessage)}</Box>;
    </>
  );
};
export default ChangeRequestRow;
