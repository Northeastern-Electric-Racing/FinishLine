/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppContextAuth from './AppContextAuth';
import AppContextQuery from './AppContextQuery';
import AppContextTheme from './AppContextTheme';

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
