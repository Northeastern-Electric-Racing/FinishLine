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
import { datePipe, wbsPipe, fullNamePipe, projectWbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import {
  Chip,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { Construction, Work } from '@mui/icons-material';
import { CircularProgressProps } from '@mui/material/CircularProgress';

const CircularProgressWithLabel = (props: CircularProgressProps & { value: number }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress variant="determinate" {...props} />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography variant="caption" component="div" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
    </Box>
  </Box>
);

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
      {workPackages.data?.length === 0
        ? `No ${timelineStatus} work packages`
        : workPackages.data?.map((wp) => (
            <Card
              variant="outlined"
              key={wbsPipe(wp.wbsNum)}
              sx={{
                width: '450px',
                mr: 3,
                background: theme.palette.background.default,
                borderRadius: '16px'
              }}
            >
              <CardContent sx={{ padding: 2 }}>
                <Grid container>
                  <Grid container item xs={9} spacing={1} zeroMinWidth>
                    <Grid container item>
                      <Grid item xs={12} zeroMinWidth>
                        <Link component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(wp.wbsNum)}`}>
                          <Typography color={'white'} fontWeight={'regular'} variant="h6" noWrap>
                            {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item xs={12} zeroMinWidth>
                        <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`}>
                          <Typography fontWeight={'regular'} variant="h5" noWrap>
                            {wbsPipe(wp.wbsNum)} - {wp.name}
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} zeroMinWidth>
                      <Typography>
                        {datePipe(wp.startDate) + ' |--' + wp.duration + 'wks--| ' + datePipe(wp.endDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} zeroMinWidth>
                      <Chip
                        sx={{ maxWidth: '150px', marginTop: 1, marginRight: 2 }}
                        icon={<Construction />}
                        label={fullNamePipe(wp.projectLead)}
                      />
                      <Chip
                        sx={{ maxWidth: '150px', marginTop: 1 }}
                        icon={<Work />}
                        label={fullNamePipe(wp.projectManager)}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item xs={3} textAlign={'end'} direction={'column'} spacing={0} zeroMinWidth>
                    <Grid item xs={1} zeroMinWidth>
                      <Typography variant="subtitle1">{wp.timelineStatus}</Typography>
                    </Grid>
                    <Grid item xs={3} zeroMinWidth>
                      <CircularProgressWithLabel variant="determinate" value={wp.progress} />
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
    </Box>
  );

  return (
    <PageBlock
      title={`Work Packages By Timeline Status (${workPackages.data?.length})`}
      headerRight={
        <FormControl size="small">
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
