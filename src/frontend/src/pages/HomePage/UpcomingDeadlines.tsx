/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';

const UpcomingDeadlines: React.FC = () => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<string>('14');
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, daysUntilDeadline });

  if (workPackages.isError) {
    return <ErrorPage message={workPackages.error.message} error={workPackages.error} />;
  }

  const fullDisplay = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'auto',
        justifyContent: 'flex-start'
      }}
    >
      {workPackages.data?.length === 0
        ? 'No upcoming deadlines'
        : workPackages.data?.map((wp) => (
            <Card key={wbsPipe(wp.wbsNum)} sx={{ minWidth: 'fit-content', mr: 3 }}>
              <CardContent sx={{ padding: 3 }}>
                <Link
                  variant="h6"
                  component={RouterLink}
                  to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`}
                  sx={{ marginBottom: 2 }}
                >
                  {wbsPipe(wp.wbsNum)} - {wp.name}
                </Link>

                <Box>
                  <Box>
                    <Typography>End Date: {datePipe(wp.endDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography>
                      Progress: {percentPipe(wp.progress)}, {wp.timelineStatus}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography>Engineering Lead: {fullNamePipe(wp.projectLead)}</Typography>
                  </Box>
                  <Box>
                    <Typography>Project Manager: {fullNamePipe(wp.projectManager)}</Typography>
                  </Box>
                  <Box>
                    <Typography>
                      {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length} Deliverables
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
    </Box>
  );

  return (
    <PageBlock
      title={`Upcoming Deadlines (${workPackages.data?.length})`}
      headerRight={
        <FormControl>
          <InputLabel id="dateRange">Date Range</InputLabel>
          <Select
            label="Date Range"
            labelId="dateRange"
            value={daysUntilDeadline}
            onChange={(e) => setDaysUntilDeadline(e.target.value)}
            startAdornment={<InputAdornment position="start">Next</InputAdornment>}
            autoWidth
            endAdornment={
              <InputAdornment position="end" sx={{ marginLeft: -2, marginRight: 2 }}>
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
