/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { Grid, Divider } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCurrentUser, useCurrentUserSecureSettings } from '../../hooks/users.hooks';
import InfoBlock from '../../components/InfoBlock';
import UserOtherPref from './UserOtherPref/UserOtherPref';
import UserSchedulePref from './UserScheudlePreferences/UserSchedulePref';
import UserSecurePref from './UserSecurePreferences/UserSecurePref';
import ErrorPage from '../ErrorPage';

const ScheduleSettings: React.FC = () => {
  const auth = useAuth();
  const user = useCurrentUser();
  const [chooseModalShow, setChooseModalShow] = useState<boolean>(false);

  const {
    isLoading: secureSettingsIsLoading,
    isError: secureSettingsIsError,
    error: secureSettingsError,
    data: userSecureSettings
  } = useCurrentUserSecureSettings();

  if (secureSettingsIsError) return <ErrorPage error={secureSettingsError} message={secureSettingsError.message} />;

  if (auth.isLoading || !auth.user || secureSettingsIsLoading || !userSecureSettings) {
    return <LoadingIndicator />;
  }

  return (
    <Grid container rowGap={5} paddingBottom={2}>
      <Grid item xs={12} md={12}>
        <InfoBlock title="Finanace Secure Settings">
          <Divider />
          <UserSecurePref currentSettings={userSecureSettings} />
        </InfoBlock>
      </Grid>
      <Grid item xs={12} md={12}>
        <InfoBlock title="Schedule Settings">
          <Divider />
          <UserSchedulePref />
        </InfoBlock>
      </Grid>
      <Grid item xs={12} md={12}>
        <InfoBlock title="Other">
          <Divider />
          <UserOtherPref />
        </InfoBlock>
      </Grid>
    </Grid>
  );
};

export default ScheduleSettings;
