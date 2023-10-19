import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { wbsPipe, WorkPackage } from 'shared';
import { Box, Alert, IconButton, Collapse, Link, Typography, AlertTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { datePipe } from '../../utils/pipes';
import { NERButton } from '../../components/NERButton';

const OverdueWorkPackageAlert = ({ wp }: { wp: WorkPackage }) => {
  const history = useHistory();
  const [open, setOpen] = useState(true);

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
          <AlertTitle>Overdue Work Package:</AlertTitle>
          <Link color="inherit" component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`} noWrap>
            <Typography fontWeight={'regular'} variant="inherit">
              {wbsPipe(wp.wbsNum)} - {wp.name}
            </Typography>
          </Link>
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
        </Alert>
      </Collapse>
    </Box>
  );
};

export default OverdueWorkPackageAlert;
