/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import ChangeRequestDetails from '../ChangeRequestDetailPage/ChangeRequestDetails';
import CreateChangeRequest from '../CreateChangeRequestPage/CreateChangeRequest';
import ChangeRequestsView from './ChangeRequestsView';

const ChangeRequests: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.CHANGE_REQUESTS_OVERVIEW} component={ChangeRequestsView} />
      <Route path={routes.ALL_CHANGE_REQUESTS} component={ChangeRequestsView} />
      <Route path={routes.CHANGE_REQUESTS_NEW} component={CreateChangeRequest} />
      <Route path={routes.CHANGE_REQUESTS_BY_ID} component={ChangeRequestDetails} />
      <Route path={routes.CHANGE_REQUESTS} component={ChangeRequestsView} />
    </Switch>
  );
};

export default ChangeRequests;
