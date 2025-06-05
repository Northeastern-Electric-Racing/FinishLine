/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import FinanceDashboard from './FinanceDashboard/FinanceDashboard';
import ReimbursmentRequests from './ReimbursmentRequests';
import CompaniesPage from './CompaniesPage';

// Redirect is used since the default display page for the table should be 'my-requests'.
// It also allows the side page to stay highlighted for both tabs of the table
// by directing to just 'reimbursement-requests' and having the redirect occur
const Finance: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.REIMBURSEMENT_REQUEST_EDIT} component={ReimbursmentRequests} />
      <Route path={routes.NEW_REIMBURSEMENT_REQUEST} component={ReimbursmentRequests} />
      <Route path={routes.REIMBURSEMENT_REQUEST_BY_ID} component={ReimbursmentRequests} />
      <Route path={routes.FINANCE_DASHBOARD} component={FinanceDashboard} />
      <Route
        exact
        path={routes.REIMBURSEMENT_REQUESTS}
        component={() => <Redirect to={routes.REIMBURSEMENT_REQUESTS + '/my-requests'} />}
      />
      <Route path={routes.REIMBURSEMENT_REQUESTS} component={ReimbursmentRequests} />
      <Route path={routes.COMPANIES} component={CompaniesPage} />
    </Switch>
  );
};

export default Finance;
