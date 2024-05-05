import React from 'react';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { WbsElementStatus } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { wbsPipe } from 'shared';
import { Box, Alert, Typography, AlertTitle, Grid } from '@mui/material';
import { routes } from '../../utils/routes';
import { datePipe } from '../../utils/pipes';
import { NERButton } from '../../components/NERButton';
import { useHistory } from 'react-router-dom';

const OverdueWorkPackageAlerts: React.FC = () => {
  const user = useCurrentUser();
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active });
  const currentDate = new Date();
  const history = useHistory();

  // Filter for work packages that are overdue and the user is the project lead
  const userOverdueWorkPackages = workPackages.data
    ?.filter((wp) => wp.lead?.userId === user.userId)
    ?.filter((wp) => new Date(wp.endDate) < currentDate);

  // If there are no overdue work packages, don't display anything
  if (!userOverdueWorkPackages || userOverdueWorkPackages.length === 0) {
    return null;
  } else {
    return (
      <Box sx={{ width: '100%', my: 2 }}>
        <Alert
          variant="filled"
          severity="warning"
          sx={{
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box>
            <AlertTitle>
              {userOverdueWorkPackages.length > 1 ? 'Overdue Work Packages:' : 'Overdue Work Package:'}
            </AlertTitle>
            <Grid container spacing={2}>
              {userOverdueWorkPackages.map((wp) => (
                <Grid item xs={6} md={3} key={wp.id}>
                  {wbsPipe(wp.wbsNum)} - {wp.name}
                  <Typography fontWeight={'regular'} variant="inherit" noWrap my={0.5}>
                    {'Due: ' + datePipe(wp.endDate)}
                  </Typography>
                  <NERButton
                    variant="contained"
                    size="small"
                    onClick={() => history.push(`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`)}
                  >
                    Create Change Request
                  </NERButton>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Alert>
      </Box>
    );
  }
};

export default OverdueWorkPackageAlerts;
