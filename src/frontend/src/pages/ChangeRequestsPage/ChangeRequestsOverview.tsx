/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useTheme } from '@mui/system';
import { Add } from '@mui/icons-material';
import { routes } from '../../utils/routes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Link, Tab, Tabs } from '@mui/material';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { ChangeRequest, ChangeRequestType, isGuest, validateWBS, WbsNumber } from 'shared';

const ChangeRequestsOverview: React.FC = () => {
  const history = useHistory();
  const { isLoading, isError, data, error } = useAllChangeRequests();

  const auth = useAuth();
  const theme = useTheme();

  // Values that go in the URL depending on the tab value
  const viewUrlValues = useMemo(() => ['overview', 'all-change-requests'], []);

  const match = useRouteMatch<{ tabValueString: string }>(`${routes.CHANGE_REQUESTS}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  // Default to the "overview" tab
  const initialValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
  const [value, setValue] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
    setValue(newTabValue);
  }, [pathname, setValue, viewUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <div>
      <div style={{ marginBottom: 15 }}>
        <PageTitle
          title={'Change Requests'}
          previousPages={[]}
          tabs={
            <Tabs value={value} onChange={handleTabChange} variant="standard" aria-label="change-request-tabs">
              <Tab
                label="Overview"
                aria-label="overview"
                value={0}
                component={RouterLink}
                to={`${routes.CHANGE_REQUESTS}/overview`}
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
      </div>
    </div>
  );
};

export default ChangeRequestsOverview;
