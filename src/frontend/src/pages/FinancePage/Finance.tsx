/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'; // Import Redirect to handle unauthorized access
import { routes } from '../../utils/routes';
import FinancePage from './FinancePage';
import CreateReimbursementRequestPage from './CreateReimbursementRequest';
import EditReimbursementRequestPage from './EditReimbursementRequest/EditReimbursementRequest';
import ReimbursementRequestDetails from './ReimbursementRequestDetailPage/ReimbursementRequestDetails';
import { isAdmin } from 'shared'; // Import the isAdmin function or your authentication logic
import { useCurrentUser } from '../../hooks/users.hooks';

const Finance: React.FC = () => {
  const user = useCurrentUser();
  const userRole = user.role;

  return (
    <Switch>
      <Route path={routes.REIMBURSEMENT_REQUEST_EDIT} component={EditReimbursementRequestPage} />
      <Route path={routes.NEW_REIMBURSEMENT_REQUEST} component={CreateReimbursementRequestPage} />
      <Route path={routes.REIMBURSEMENT_REQUEST_BY_ID} component={ReimbursementRequestDetails} />
      <Route path={routes.FINANCE}>
        {isAdmin(userRole) ? (
          // Render the FinancePage component if the user is an admin
          <FinancePage />
        ) : (
          // Redirect to another route if the user is not an admin
          <Redirect to="/unauthorized" />
        )}
      </Route>
      {/* Define a route for unauthorized access */}
      <Route path="/unauthorized">
        <div>
          <p>Access Denied. You are not an admin.</p>
          {/* You can provide a link or additional information here */}
        </div>
      </Route>
    </Switch>
  );
};

export default Finance;
