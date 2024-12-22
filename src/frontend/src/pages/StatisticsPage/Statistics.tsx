import { Switch, Route } from 'react-router-dom';
import { routes } from '../../utils/routes';
import StatisticsPage from './StatisticsPage';
import CreateGraphForm from './CreateGraphForm/CreateGraphForm';
import GraphCollectionViewContainer from './GraphCollectionViewContainer/GraphCollectionViewContainer';

const Statistics: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.GRAPH_COLLECTION_BY_ID} component={GraphCollectionViewContainer} />
      <Route path={routes.CREATE_GRAPH} component={CreateGraphForm} />
      <Route path={routes.STATISTICS} component={StatisticsPage} />
    </Switch>
  );
};

export default Statistics;
