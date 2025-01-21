import { useHistory } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { useState } from 'react';
import { routes } from '../../utils/routes';
import { isGuest } from 'shared';
import { Add } from '@mui/icons-material';
import { useCurrentUser } from '../../hooks/users.hooks';
import ChangeRequestsOverview from './ChangeRequestsOverview';
import ChangeRequestsTable from './ChangeRequestsTable';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';

const ChangeRequestsView: React.FC = () => {
  const history = useHistory();
  const user = useCurrentUser();

  // Default to the "overview" tab
  const [tabIndex, setTabIndex] = useState<number>(0);

  const headerRight = (
    <NERButton
      variant="contained"
      disabled={isGuest(user.role)}
      startIcon={<Add />}
      onClick={() => history.push(routes.CHANGE_REQUESTS_NEW)}
    >
      New Change Request
    </NERButton>
  );

  return (
    <PageLayout
      title="Change Requests"
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
      headerRight={headerRight}
    >
      {tabIndex === 0 ? <ChangeRequestsOverview /> : <ChangeRequestsTable />}
    </PageLayout>
  );
};

export default ChangeRequestsView;
