/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import MemberHomePage from './MemberHomePage';
import GuestHomePage from './GuestHomePage';
import PNMHomePage from './PNMHomePage';

const Home: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.HOME_PNM} component={PNMHomePage} />
      <Route path={routes.HOME_GUEST} component={GuestHomePage} />
      <Route path={routes.HOME} component={MemberHomePage} />
    </Switch>
  );
};

export default Home;
