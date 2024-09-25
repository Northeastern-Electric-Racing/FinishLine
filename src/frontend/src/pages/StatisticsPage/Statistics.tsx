import { Switch, Route } from 'react-router-dom';
import { routes } from '../../utils/routes';
import StatisticsPage from './StatisticsPage';

const Statistics: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.STATISTICS} component={StatisticsPage} />
    </Switch>
  );
};

export default Statistics;
