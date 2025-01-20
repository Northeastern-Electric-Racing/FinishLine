/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import FinancePage from './FinancePage';
import CreateReimbursementRequestPage from './CreateReimbursementRequest';
import EditReimbursementRequestPage from './EditReimbursementRequest/EditReimbursementRequest';
import ReimbursementRequestDetails from './ReimbursementRequestDetailPage/ReimbursementRequestDetails';
import FinanceDashboard from './FinanceDashboard';
import ReimbursmentRequests from './ReimbursmentRequests';
import CompaniesAndSponsors from './CompaniesAndSponsors';

const Finance: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.REIMBURSEMENT_REQUEST_EDIT} component={EditReimbursementRequestPage} />
      <Route path={routes.NEW_REIMBURSEMENT_REQUEST} component={CreateReimbursementRequestPage} />
      <Route path={routes.REIMBURSEMENT_REQUEST_BY_ID} component={ReimbursementRequestDetails} />
      <Route path={routes.FINANCE_DASHBOARD} component={FinanceDashboard} />
      <Route path={routes.REIMBURSEMENT_REQUESTS} component={ReimbursmentRequests} />
      <Route path={routes.COMPANIES_SPONSORS} component={CompaniesAndSponsors} />
      <Route path={routes.FINANCE} component={FinancePage} />
    </Switch>
  );
};

export default Finance;
