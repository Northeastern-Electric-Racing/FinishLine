/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import PageBlock from '../../layouts/PageBlock';
import UserSettings from './UserSettings/UserSettings';
import { Alert, Grid, Switch, FormGroup, FormControlLabel, SwitchProps, styled } from '@mui/material';
import DetailDisplay from '../../components/DetailDisplay';
import LoadingIndicator from '../../components/LoadingIndicator';
import { GoogleLogout } from 'react-google-login';
import PageLayout from '../../components/PageLayout';
import { useCurrentUser, useCurrentUserSecureSettings, useSingleUserSettings } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import UserSecureSettings from './UserSecureSettings/UserSecureSettings';
import { useAllTeams } from '../../hooks/teams.hooks';
import { displayEnum } from '../../utils/pipes';

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
  const user = useCurrentUser();
  const [showAlert, setShowAlert] = useState(false);
  const {
    isLoading: settingsIsLoading,
    isError: settingsIsError,
    error: settingsError,
    data: userSettingsData
  } = useSingleUserSettings(user.userId);
  const {
    isLoading: secureSettingsIsLoading,
    isError: secureSettingsIsError,
    error: secureSettingsError,
    data: userSecureSettings
  } = useCurrentUserSecureSettings();
  const { isLoading: allTeamsIsLoading, isError: allTeamsIsError, data: teams, error: allTeamsError } = useAllTeams();

  if (secureSettingsIsError) return <ErrorPage error={secureSettingsError} message={secureSettingsError.message} />;
  if (settingsIsError) return <ErrorPage error={settingsError} message={settingsError.message} />;
  if (allTeamsIsError) return <ErrorPage error={allTeamsError} message={allTeamsError.message} />;
  if (
    auth.isLoading ||
    !auth.user ||
    settingsIsLoading ||
    !userSettingsData ||
    secureSettingsIsLoading ||
    !userSecureSettings ||
    allTeamsIsLoading ||
    !teams
  )
    return <LoadingIndicator />;

  const logout = () => {
    setShowAlert(true);
    setTimeout(() => {
      auth.signout();
    }, 2000);
  };

  const userTeams = teams.filter((team) =>
    team.members.some((member) => member.userId === user.userId || team.head.userId === user.userId)
  );

  return (
    <PageLayout title="Settings">
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
                  import.meta.env.MODE === 'development' ? (
                    <NERSwitch id="trick-switch" sx={{ m: 1 }} onClick={logout} />
                  ) : (
                    <GoogleLogout
                      clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || ''}
                      onLogoutSuccess={logout}
                      render={(renderProps) => <NERSwitch id="trick-switch" sx={{ m: 1 }} onClick={renderProps.onClick} />}
                    />
                  )
                }
              />
            </FormGroup>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="User Details">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg>
            <DetailDisplay label="First Name" content={user.firstName} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg>
            <DetailDisplay label="Last Name" content={user.lastName} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <DetailDisplay label="Email" content={user.email} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg>
            <DetailDisplay label="Email ID" content={String(user.emailId)} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg>
            <DetailDisplay label="Role" content={displayEnum(user.role)} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg>
            <DetailDisplay
              label="Teams"
              content={userTeams.length === 0 ? 'None' : userTeams.map((team) => team.teamName).join(', ')}
            />
          </Grid>
        </Grid>
      </PageBlock>
      <UserSettings currentSettings={userSettingsData} />
      <UserSecureSettings currentSettings={userSecureSettings} />
    </PageLayout>
  );
};

export default Settings;
