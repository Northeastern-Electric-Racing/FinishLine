/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import ChangeRequestDetails from '../ChangeRequestDetailPage/ChangeRequestDetails';
import ChangeRequestsTable from './ChangeRequestsTable';
import CreateChangeRequest from '../CreateChangeRequestPage/CreateChangeRequest';

const ChangeRequests: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.CHANGE_REQUESTS_NEW} component={CreateChangeRequest} />
      <Route path={routes.CHANGE_REQUESTS_BY_ID} component={ChangeRequestDetails} />
      <Route path={routes.CHANGE_REQUESTS} component={ChangeRequestsTable} />
    </Switch>
  );
};

export default ChangeRequests;
