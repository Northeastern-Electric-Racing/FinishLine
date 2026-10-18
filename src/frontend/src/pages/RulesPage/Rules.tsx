// switch route page for rules
import { Redirect, Route, Switch } from 'react-router-dom';
import { isGuest } from 'shared';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import RulesetTypePage from './RulesetTypePage';
import RulesetPage from './RulesetPage';
import RulesetEditPage from './RulesetEditPage';
import RulesetViewPage from './RulesetViewPage';

const RulesPage: React.FC = () => {
  const user = useCurrentUser();

  if (isGuest(user.role)) {
    return (
      <Redirect
        to={{
          pathname: routes.HOME
        }}
      />
    );
  }

  return (
    <Switch>
      <Route path={routes.RULESET_EDIT} component={RulesetEditPage} />
      <Route path={routes.RULESET_VIEW} component={RulesetViewPage} />
      <Route path={routes.RULESET_BY_ID} component={RulesetPage} />
      <Route path={routes.RULES} component={RulesetTypePage} />
    </Switch>
  );
};

export default RulesPage;
