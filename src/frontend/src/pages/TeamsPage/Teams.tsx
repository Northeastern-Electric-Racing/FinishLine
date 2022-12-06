import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/Routes';
import TeamsPage from './TeamsPage';
import TeamSpecificPage from './TeamSpecificPage';

const Teams: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.TEAMS_BY_ID} component={TeamSpecificPage} />
      <Route path={routes.TEAMS} component={TeamsPage} />
    </Switch>
  );
};

export default Teams
