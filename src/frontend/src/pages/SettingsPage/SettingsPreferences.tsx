import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import UserSettings from './UserSettings/UserSettings';
import { Alert } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { useCurrentUser, useCurrentUserSecureSettings, useSingleUserSettings } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import { useAllTeams } from '../../hooks/teams.hooks';

const SettingsPreferences: React.FC = () => {
  const auth = useAuth();
  const user = useCurrentUser();
  const showAlert = useState(false);
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

  return (
    <PageLayout title="Preferences">
      {showAlert && <Alert severity="info">Haha {auth.user?.firstName} bye bye!</Alert>}
      <UserSettings currentSettings={userSettingsData} />
    </PageLayout>
  );
};

export default SettingsPreferences;
