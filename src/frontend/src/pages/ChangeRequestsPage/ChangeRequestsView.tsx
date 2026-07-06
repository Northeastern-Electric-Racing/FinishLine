import { useState } from 'react';
import { routes } from '../../utils/routes';
import { isGuest } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useGlobalCarFilter } from '../../app/AppGlobalCarFilterContext';
import ChangeRequestsOverview from './ChangeRequestsOverview';
import ChangeRequestsTable from './ChangeRequestsTable';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';
import GuestChangeRequestsPage from './GuestChangeRequestsPage';

const ChangeRequestsView: React.FC = () => {
  const user = useCurrentUser();
  const { selectedCar } = useGlobalCarFilter();

  // Default to the "overview" tab
  const [tabIndex, setTabIndex] = useState<number>(0);

  if (isGuest(user.role)) {
    return <GuestChangeRequestsPage />;
  }

  return (
    <PageLayout
      title={
        selectedCar ? `Change Requests For ${selectedCar === 'all-cars' ? 'All Cars' : selectedCar.name}` : 'Change Requests'
      }
      tabs={
        <FullPageTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'overview', tabName: 'Overview' },
            { tabUrlValue: 'all', tabName: 'All Change Requests' }
          ]}
          baseUrl={routes.CHANGE_REQUESTS}
          defaultTab="overview"
          id="cr-tabs"
        />
      }
    >
      {tabIndex === 0 ? <ChangeRequestsOverview /> : <ChangeRequestsTable />}
    </PageLayout>
  );
};

export default ChangeRequestsView;
