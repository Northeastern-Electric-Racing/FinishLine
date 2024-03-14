/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import Details from './Details';
import Preferences from './Preferences';

const Settings: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.SETTINGS_DETAILS} component={Details} />
      <Route path={routes.SETTINGS_PREFERENCES} component={Preferences} />
    </Switch>
  );
};

export default Settings;
