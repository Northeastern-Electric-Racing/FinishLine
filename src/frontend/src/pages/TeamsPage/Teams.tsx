/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import TeamsPage from './TeamsPage';
import TeamSpecificPage from './TeamSpecificPage';

const Teams = () => {
  return (
    <Switch>
      <Route path={routes.TEAMS_BY_ID} component={TeamSpecificPage} />
      <Route path={routes.TEAMS} component={TeamsPage} />
    </Switch>
  );
};

export default Teams;
