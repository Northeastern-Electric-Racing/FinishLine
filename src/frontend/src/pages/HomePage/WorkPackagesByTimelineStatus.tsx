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
import { Chip, Grid, FormControl, InputLabel, MenuItem, Select, Typography, useTheme } from '@mui/material';
import { Construction, Work } from '@mui/icons-material';
import { CircularProgressWithLabel } from '../../components/CircularProgress';

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
        : [
            ...(workPackages.data ?? []),
            ...(workPackages.data ?? []),
            ...(workPackages.data ?? []),
            ...(workPackages.data ?? [])
          ]?.map((wp) => (
            <Card
              variant="outlined"
              key={wbsPipe(wp.wbsNum)}
              sx={{
                maxWidth: '450px',
                mr: 3,
                background: theme.palette.background.default
              }}
            >
              <CardContent sx={{ padding: 2 }}>
                <Grid container>
                  <Grid container item xs={9} spacing={0} zeroMinWidth>
                    <Grid container item>
                      <Grid item xs={12} zeroMinWidth>
                        <Typography fontWeight={'regular'} variant="subtitle2" noWrap>
                          <Link
                            color={'text.primary'}
                            component={RouterLink}
                            to={`${routes.PROJECTS}/${projectWbsPipe(wp.wbsNum)}`}
                          >
                            {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
                          </Link>
                        </Typography>
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
                      <Typography fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
                        {datePipe(wp.startDate) + ' |一 ' + wp.duration + ' wks 一| ' + datePipe(wp.endDate)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container item xs={3} textAlign={'end'} direction={'column'} spacing={0} zeroMinWidth>
                    <Grid item xs={1} zeroMinWidth>
                      <Typography noWrap variant="subtitle1">
                        {wp.timelineStatus}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} zeroMinWidth>
                      <CircularProgressWithLabel variant="determinate" value={wp.progress} />
                    </Grid>
                  </Grid>
                  <Grid item xs={5} sm={4} md={4} zeroMinWidth>
                    <Chip
                      sx={{ marginTop: 1, marginRight: 2 }}
                      icon={<Construction />}
                      label={fullNamePipe(wp.projectLead)}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={5} sm={4} md={4} zeroMinWidth>
                    <Chip sx={{ marginTop: 1 }} icon={<Work />} label={fullNamePipe(wp.projectManager)} size="medium" />
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
