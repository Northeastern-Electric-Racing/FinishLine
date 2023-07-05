/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import FinancePage from './FinancePage';
import CreateReimbursementRequestForm from './CreateReimbursementRequestForm/CreateReimbursementRequestForm';
import ReimbursementRequestPage from './ReimbursementRequestPage/ReimbursementRequestPage';

const Finance: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.NEW_REIMBURSEMENT_REQUEST} component={CreateReimbursementRequestForm} />
      <Route path={routes.REIMBURSEMENT_REQUEST_BY_ID} component={ReimbursementRequestPage} />
      <Route path={routes.FINANCE} component={FinancePage} />
    </Switch>
  );
};

export default Finance;
