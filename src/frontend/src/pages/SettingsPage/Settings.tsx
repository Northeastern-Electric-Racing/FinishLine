/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import SettingsDetails from './SettingsDetails';
import SettingsPreferences from './SettingsPreferences';

const Settings: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.SETTINGS_DETAILS} component={SettingsDetails} />
      <Route path={routes.SETTINGS_PREFERENCES} component={SettingsPreferences} />
    </Switch>
  );
};

export default Settings;
