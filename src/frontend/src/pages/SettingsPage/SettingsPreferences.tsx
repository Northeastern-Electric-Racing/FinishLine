import { useAuth } from '../../hooks/auth.hooks';
import UserSettings from './UserSettings/UserSettings';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCurrentUser, useCurrentUserSecureSettings, useSingleUserSettings } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import { useAllTeams } from '../../hooks/teams.hooks';
import { Grid, FormGroup, FormControlLabel, Switch, SwitchProps, styled, Alert, Typography } from '@mui/material';
import { GoogleLogout } from 'react-google-login';
import { useState } from 'react';
import UserSecureSettings from './UserSecureSettings/UserSecureSettings';
import UserScheduleSettings from './UserScheduleSettings/UserScheduleSettings';
import { Box } from '@mui/system';

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

const SettingsPreferences: React.FC = () => {
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

  return (
    <Box>
      {showAlert && <Alert severity="info">Haha {auth.user?.firstName} bye bye!</Alert>}
      <UserSettings currentSettings={userSettingsData} />
      <UserSecureSettings currentSettings={userSecureSettings} />
      <UserScheduleSettings user={user} />
      <Grid container mt={1.5}>
        <Grid
          container
          spacing={1}
          direction={'row'}
          borderColor={'white'}
          marginBottom={'20px'}
          borderBottom={1}
          paddingBottom={'10px'}
        >
          <Grid item>
            <Typography variant="h5" color={'primary'}>
              Other Settings
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
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
    </Box>
  );
};

export default SettingsPreferences;
