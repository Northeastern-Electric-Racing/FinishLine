/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { TimelineStatus, WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';

const WorkPackagesByTimelineStatus: React.FC = () => {
  const [timelineStatus, setTimelineStatus] = useState<TimelineStatus>(TimelineStatus.VeryBehind);
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, timelineStatus });

  useEffect(() => {
    workPackages.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineStatus]);

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
        ? `No ${timelineStatus} work packages`
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
              </CardContent>
            </Card>
          ))}
    </Box>
  );

  return (
    <PageBlock
      title={`Work Packages By Timeline Status (${workPackages.data?.length})`}
      headerRight={
        <FormControl>
          <InputLabel id="selectTimelineStatus"> Timeline Status</InputLabel>
          <Select
            label="Timeline Status"
            labelId="selectTimelineStatus"
            value={timelineStatus}
            onChange={(e) => setTimelineStatus(e.target.value as TimelineStatus)}
          >
            {Object.values(TimelineStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    >
      {workPackages.isLoading ? <LoadingIndicator /> : fullDisplay}
    </PageBlock>
  );
};

export default WorkPackagesByTimelineStatus;
