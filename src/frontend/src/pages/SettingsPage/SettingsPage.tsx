/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';
import Settings from './Settings';
import ScheduleSettings from './ScheduleSettings';

const SettingsPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Settings"
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'deatails', tabName: 'DETAILS' },
            { tabUrlValue: 'preference', tabName: 'PREFERENCES' }
          ]}
          baseUrl={routes.SETTINGS}
          defaultTab="deatails"
          id="settings-tabs"
        />
      }
    >
      {tabIndex === 0 ? <Settings /> : <ScheduleSettings />}
    </PageLayout>
  );
};

export default SettingsPage;
