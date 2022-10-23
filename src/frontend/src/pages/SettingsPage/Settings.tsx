/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import UserSettings from './UserSettings/UserSettings';
import { Alert, Grid, Switch, FormGroup, FormControlLabel } from '@mui/material';
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
            <b>Name:</b> Northeastern Electric Racing
          </Grid>
          <Grid item>
            <FormGroup>
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
            <b>First Name:</b> {auth.user?.firstName}
          </Grid>
          <Grid item md={4} lg={2}>
            <b>Last Name:</b> {auth.user?.lastName}
          </Grid>
          <Grid item md={4} lg={3}>
            <b>Email: </b> {auth.user?.email}
          </Grid>
          <Grid item md={4} lg={2}>
            <b>Email ID:</b> {auth.user?.emailId}
          </Grid>
          <Grid item md={4} lg={2}>
            <b>Role: </b> {auth.user?.role}
          </Grid>
        </Grid>
      </PageBlock>
      <UserSettings userId={auth.user.userId} />
    </>
  );
};

export default Settings;
