import { Tab, Tabs } from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Link as RouterLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { useEffect, useMemo, useState } from 'react';
import { routes } from '../../utils/routes';
import { isGuest } from 'shared';
import { Add } from '@mui/icons-material';
import { useAuth } from '../../hooks/auth.hooks';
import { Box } from '@mui/system';

const ChangeRequestsTitle: React.FC = () => {
  const history = useHistory();

  const auth = useAuth();

  // Values that go in the URL depending on the tab value
  const viewUrlValues = useMemo(() => ['overview', 'all'], []);

  const match = useRouteMatch<{ tabValueString: string }>(`${routes.CHANGE_REQUESTS}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  // Default to the "overview" tab
  const initialValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
  const [tabIndex, setTabIndex] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
    setTabIndex(newTabValue);
  }, [pathname, setTabIndex, viewUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  return (
    <Box style={{ marginBottom: 15 }}>
      <PageTitle
        title={'Change Requests'}
        previousPages={[]}
        tabs={
          <Tabs value={tabIndex} onChange={handleTabChange} variant="standard" aria-label="change-request-tabs">
            <Tab
              label="Overview"
              aria-label="overview"
              value={0}
              component={RouterLink}
              to={`${routes.CHANGE_REQUESTS_OVERVIEW}`}
            />
            <Tab
              label="All Change Requests"
              aria-label="all-change-requests"
              value={1}
              component={RouterLink}
              to={`${routes.ALL_CHANGE_REQUESTS}`}
            />
          </Tabs>
        }
        actionButton={
          <NERButton
            variant="contained"
            disabled={isGuest(auth.user?.role)}
            startIcon={<Add />}
            onClick={() => history.push(routes.CHANGE_REQUESTS_NEW)}
          >
            New Change Request
          </NERButton>
        }
      />
    </Box>
  );
};

export default ChangeRequestsTitle;
