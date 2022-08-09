/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppContextAuth from './app-context-auth';
import AppContextQuery from './app-context-query';
import AppContextTheme from './app-context-theme';

const AppContext: React.FC = (props) => {
  return (
    <AppContextQuery>
      <AppContextAuth>
        <AppContextTheme>{props.children}</AppContextTheme>
      </AppContextAuth>
    </AppContextQuery>
  );
};

export default AppContext;
