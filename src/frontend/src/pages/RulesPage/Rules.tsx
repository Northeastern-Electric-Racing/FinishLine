import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import RulesetTypePage from './RulesetTypePage';
import RulesetPage from './RulesetPage';
import RulesetEditPage from './RulesetEditPage';

const RulesPage: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.RULESET_EDIT} component={RulesetEditPage} />
      <Route path={routes.RULESET_BY_ID} component={RulesetPage} />
      <Route path={routes.RULES} component={RulesetTypePage} />
    </Switch>
  );
};

export default RulesPage;
