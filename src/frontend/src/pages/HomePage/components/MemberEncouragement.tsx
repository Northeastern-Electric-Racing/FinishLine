import React from 'react';
import { Box, Alert, Typography, Grid } from '@mui/material';
import { routes } from '../../../utils/routes';
import { NERButton } from '../../../components/NERButton';
import { useHistory } from 'react-router-dom';

const MemberEncouragement: React.FC = () => {
  const history = useHistory();
  return (
    <Box sx={{ width: '100%', my: 2, mx: 'auto' }}>
      <Alert
        variant="filled"
        severity="info"
        icon={false}
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6" color="white">
              Already a member?
            </Typography>
            <Typography variant="body2" color="white">
              Talk to the head of your team to become a member and get added to the team on FinishLine!
            </Typography>
          </Grid>
          <Grid item>
            <NERButton
              variant="contained"
              size="small"
              sx={{ color: 'white' }}
              onClick={() => {
                history.push(routes.TEAMS);
              }}
            >
              See Teams &gt;
            </NERButton>
          </Grid>
        </Grid>
      </Alert>
    </Box>
  );
};

export default MemberEncouragement;
