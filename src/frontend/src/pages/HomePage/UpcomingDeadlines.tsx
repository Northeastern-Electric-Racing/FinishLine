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
import { Link as RouterLink } from 'react-router-dom';
import { WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import { Grid, Typography, useTheme } from '@mui/material';
import DetailDisplay from '../../components/DetailDisplay';
import { DetailDisplayProps } from '../../components/DetailDisplay';

const UpcomingDeadlinesDetailDisplay: React.FC<DetailDisplayProps> = ({ label, content }) => {
  return <DetailDisplay label={label} content={content} paddingRight={2}></DetailDisplay>;
};

const UpcomingDeadlines: React.FC = () => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<string>('14');
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, daysUntilDeadline });
  const theme = useTheme();

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
      {workPackages.data?.length === 0 ? (
        <Typography>No upcoming deadlines</Typography>
      ) : (
        workPackages.data?.map((wp) => (
          <Card
            variant="outlined"
            key={wbsPipe(wp.wbsNum)}
            sx={{ minWidth: 'fit-content', mr: 3, background: theme.palette.background.default }}
          >
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
                  <UpcomingDeadlinesDetailDisplay
                    label="End Date"
                    content={datePipe(wp.endDate)}
                  ></UpcomingDeadlinesDetailDisplay>
                </Box>
                <Box>
                  <UpcomingDeadlinesDetailDisplay
                    label="Progress"
                    content={percentPipe(wp.progress) + ', ' + wp.timelineStatus}
                  ></UpcomingDeadlinesDetailDisplay>
                </Box>
                <Box>
                  <UpcomingDeadlinesDetailDisplay
                    label="Engineering Lead"
                    content={fullNamePipe(wp.projectLead)}
                  ></UpcomingDeadlinesDetailDisplay>
                </Box>
                <Box>
                  <UpcomingDeadlinesDetailDisplay
                    label="Project Manager"
                    content={fullNamePipe(wp.projectManager)}
                  ></UpcomingDeadlinesDetailDisplay>
                </Box>
                <Box>
                  <Typography>
                    {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length} Deliverables
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
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
            variant="standard"
            sx={{ border: '1px solid ' + theme.palette.divider, borderRadius: 2, padding: 1 }}
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
