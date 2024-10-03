/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import SettingsPreferences from './SettingsPreferences';
import SettingsDetails from './SettingsDetails';
import { routes } from '../../utils/routes';
import FullPageTabs from '../../components/FullPageTabs';
import { Box } from '@mui/material';

const SettingsPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Settings"
      tabs={
        <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
          <FullPageTabs
            noUnderline
            setTab={setTabIndex}
            tabsLabels={[
              { tabUrlValue: 'details', tabName: 'Details' },
              { tabUrlValue: 'preferences', tabName: 'Preferences' }
            ]}
            baseUrl={routes.SETTINGS}
            defaultTab="details"
            id="settings-tabs"
          />
        </Box>
      }
    >
      {tabIndex === 0 ? <SettingsDetails /> : <SettingsPreferences />}
    </PageLayout>
  );
};

export default SettingsPage;
