/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import UserSettings from './UserSettings/UserSettings';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import LoadingIndicator from '../../components/LoadingIndicator';

const Settings: React.FC = () => {
  const auth = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  if (auth.isLoading || !auth.user) return <LoadingIndicator />;

  return (
    <>
      <PageTitle title={'Settings'} previousPages={[]} />
      {showAlert && <Alert severity="info">Haha {auth.user?.firstName} bye bye!</Alert>}
      <PageBlock title={'Organization Settings'}>
        <Grid container>
          <Grid item md={12}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              Name:
            </Typography>
            <Typography display="inline"> Northeastern Electric Racing</Typography>
          </Grid>
          <Grid item>
            <FormGroup>
              {' '}
              <FormControlLabel
                label="Trickster Mode"
                control={
                  <Switch
                    id="trick-switch"
                    onClick={() => {
                      setShowAlert(true);
                      setTimeout(() => {
                        auth.signout();
                      }, 2000);
                    }}
                  />
                }
              />
            </FormGroup>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="User Details">
        <Grid container>
          <Grid item md={4} lg={2}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              First Name:
            </Typography>
            <Typography display="inline"> {auth.user?.firstName}</Typography>
          </Grid>
          <Grid item md={4} lg={2}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              Last Name:
            </Typography>
            <Typography display="inline"> {auth.user?.lastName}</Typography>
          </Grid>
          <Grid item md={4} lg={3}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              Email:
            </Typography>
            <Typography display="inline"> {auth.user?.email}</Typography>
          </Grid>
          <Grid item md={4} lg={2}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              Email ID:
            </Typography>
            <Typography display="inline"> {auth.user?.emailId}</Typography>
          </Grid>
          <Grid item md={4} lg={2}>
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              Role:
            </Typography>
            <Typography display="inline"> {auth.user?.role}</Typography>
          </Grid>
        </Grid>
      </PageBlock>
      <UserSettings userId={auth.user.userId} />
    </>
  );
};

export default Settings;
