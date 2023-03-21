/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { CardContentInfo } from '../../pages/HomePage/AbstractCardContent';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import { Grid, Typography, useTheme } from '@mui/material';

const UpcomingDeadlines: React.FC = () => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<string>('14');
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, daysUntilDeadline });
  const theme = useTheme();

  if (workPackages.isError) {
    return <ErrorPage message={workPackages.error.message} error={workPackages.error} />;
  }
  let contentCreater = new CardContentInfo();

  const fullDisplay = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
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
      {workPackages.data?.length === 0 ? (
        <Typography>No upcoming deadlines</Typography>
      ) : (
        workPackages.data?.map((wp) => contentCreater.createUpcomingDeadlineCard(wp, theme))
      )}
    </Box>
  );

  return (
    <PageBlock
      title={`Upcoming Deadlines (${workPackages.data?.length})`}
      headerRight={
        <FormControl size="small">
          <InputLabel id="dateRange">Date Range</InputLabel>
          <Select
            label="Date Range"
            labelId="dateRange"
            value={daysUntilDeadline}
            onChange={(e) => setDaysUntilDeadline(e.target.value)}
            endAdornment={
              <InputAdornment position="end" sx={{ marginLeft: -3, marginRight: 2 }}>
                Days
              </InputAdornment>
            }
          >
            {['1', '2', '5', '7', '14', '21', '30'].map((days) => (
              <MenuItem key={days} value={days}>
                {days}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    >
      <Grid container>{workPackages.isLoading ? <LoadingIndicator /> : fullDisplay}</Grid>
    </PageBlock>
  );
};

export default UpcomingDeadlines;
