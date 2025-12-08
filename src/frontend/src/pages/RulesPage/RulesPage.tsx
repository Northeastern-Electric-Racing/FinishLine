/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import RulesetTypePage from './RulesetTypePage';
import RulesetPage from './RulesetPage';
import RulesetViewPage from './RulesetView';

const RulesPage: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.RULESET} component={RulesetViewPage} />
      <Route path={routes.RULESET_BY_ID} component={RulesetPage} />
      <Route path={routes.RULES} component={RulesetTypePage} />
    </Switch>
  );
};

export default RulesPage;
