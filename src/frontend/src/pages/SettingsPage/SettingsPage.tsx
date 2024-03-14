/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Preferences from './Preferences';
import Details from './Details';
import { routes } from '../../utils/routes';
import NERTabs from '../../components/Tabs';

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
