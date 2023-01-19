/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import UserSettings from './UserSettings/UserSettings';
import { Alert, Grid, Switch, FormGroup, FormControlLabel, SwitchProps, styled } from '@mui/material';
import DetailDisplay from '../../components/DetailDisplay';
import LoadingIndicator from '../../components/LoadingIndicator';

const NERSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 34,
  height: 18,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#ef4345' : '#ef4345',
        opacity: 1,
        border: 0
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#ef4345',
      border: '6px solid #fff'
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,
    height: 14
  },
  '& .MuiSwitch-track': {
    borderRadius: 18 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    })
  }
}));

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
          <Grid item xs={6} md={12}>
            <DetailDisplay label="Name" content="Northeastern Electric Racing" />
          </Grid>
          <Grid item xs={6} md={12}>
            <FormGroup>
              <FormControlLabel
                label="Trickster Mode"
                control={
                  <NERSwitch
                    id="trick-switch"
                    sx={{ m: 1 }}
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
            <DetailDisplay label="First Name" content={auth.user?.firstName} />
          </Grid>
          <Grid item md={4} lg={2}>
            <DetailDisplay label="Last Name" content={auth.user?.lastName} />
          </Grid>
          <Grid item md={4} lg={3}>
            <DetailDisplay label="Email" content={auth.user?.email} />
          </Grid>
          <Grid item md={4} lg={2}>
            <DetailDisplay label="Email ID" content={String(auth.user?.emailId)} />
          </Grid>
          <Grid item md={4} lg={2}>
            <DetailDisplay label="Role" content={auth.user?.role} />
          </Grid>
        </Grid>
      </PageBlock>
      <UserSettings userId={auth.user.userId} />
    </>
  );
};

export default Settings;
