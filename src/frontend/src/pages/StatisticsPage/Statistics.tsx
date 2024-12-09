import { Switch, Route } from 'react-router-dom';
import { routes } from '../../utils/routes';
import StatisticsPage from './StatisticsPage';
import CreateGraphForm from './CreateGraphForm/CreateGraphForm';

const Statistics: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.STATISTICS} component={StatisticsPage} />
      <Route path={routes.CREATE_GRAPH} component={CreateGraphForm} />

      {/* Add more routes here */}
    </Switch>
  );
};

export default Statistics;
