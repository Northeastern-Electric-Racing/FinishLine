import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import CreditsPage from './CreditsPage';

const Credits: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.CREDITS} component={CreditsPage} />
    </Switch>
  );
};

export default Credits;
