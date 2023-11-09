import React from 'react';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { WbsElementStatus } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useState } from 'react';
import { wbsPipe } from 'shared';
import { Box, Alert, IconButton, Collapse, Link, Typography, AlertTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { datePipe } from '../../utils/pipes';

const OverdueWorkPackageAlerts: React.FC = () => {
  const user = useCurrentUser();
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active });
  const currentDate = new Date();
  const [open, setOpen] = useState(true);

  // Filter for work packages that are overdue and the user is the project lead
  const userOverdueWorkPackages = workPackages.data
    ?.filter((wp) => wp.projectLead?.userId === user.userId)
    ?.filter((wp) => new Date(wp.endDate) < currentDate);

  // If there are no overdue work packages, don't display anything
  if (!userOverdueWorkPackages || userOverdueWorkPackages.length === 0) {
    return null;
  } else {
    return (
      <Box sx={{ width: '100%', my: 2 }}>
        <Collapse in={open}>
          <Alert
            variant="filled"
            severity="warning"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>
              {userOverdueWorkPackages.length > 1 ? 'Overdue Work Packages:' : 'Overdue Work Package:'}
            </AlertTitle>
            {userOverdueWorkPackages.map((wp) => (
              <React.Fragment key={wp.id}>
                <Link color="inherit" component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`} noWrap>
                  <Typography fontWeight={'regular'} variant="inherit">
                    {wbsPipe(wp.wbsNum)} - {wp.name}
                  </Typography>
                </Link>
                <Typography fontWeight={'regular'} variant="inherit" noWrap my={0.5}>
                  {'Due: ' + datePipe(wp.endDate)}
                </Typography>
              </React.Fragment>
            ))}
          </Alert>
        </Collapse>
      </Box>
    );
  }
};

export default OverdueWorkPackageAlerts;
