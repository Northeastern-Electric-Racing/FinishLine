/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { TimelineStatus, WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import { FormControl, InputBase, InputLabel, MenuItem, Select, styled, Typography, useTheme } from '@mui/material';

const NERInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(1)
  },
  '& .MuiInputBase-input': {
    borderRadius: 6,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid ' + theme.palette.divider,
    fontSize: 16,
    padding: '10px 26px 10px 12px'
  }
}));

const WorkPackagesByTimelineStatus: React.FC = () => {
  const [timelineStatus, setTimelineStatus] = useState<TimelineStatus>(TimelineStatus.VeryBehind);
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, timelineStatus });
  const theme = useTheme();

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
                  <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
                    End Date:{' '}
                  </Typography>
                  <Typography display="inline">{datePipe(wp.endDate)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
                    Progress:
                  </Typography>
                  <Typography display="inline">
                    {percentPipe(wp.progress)}, {wp.timelineStatus}{' '}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
                    Engineering Lead:
                  </Typography>
                  <Typography display="inline">{fullNamePipe(wp.projectLead)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
                    Project Manager:
                  </Typography>
                  <Typography display="inline">{fullNamePipe(wp.projectManager)}</Typography>
                </Box>
                <Box>
                  {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length} Deliverables
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
            input={<NERInput />}
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
