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
import Preferences from './Preferences';
import Details from './Details';
import { routes } from '../../utils/routes';
import NERTabs from '../../components/Tabs';

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

const SettingsPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Settings"
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'details', tabName: 'Details' },
            { tabUrlValue: 'preferences', tabName: 'Preferences' }
          ]}
          baseUrl={routes.SETTINGS}
          defaultTab="details"
          id="settings-tabs"
        />
      }
    >
      {tabIndex === 0 ? <Details /> : <Preferences />}
    </PageLayout>
  );
};

export default SettingsPage;
