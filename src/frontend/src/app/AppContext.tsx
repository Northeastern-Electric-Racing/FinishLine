/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppContextAuth from './AppContextAuth';
import AppContextQuery from './AppContextQuery';
import AppContextTheme from './AppContextTheme';

type Props = {
  children?: React.ReactNode;
};

const AppContext = (props: Props) => {
  return (
    <AppContextQuery>
      <AppContextAuth>
        <AppContextTheme>{props.children}</AppContextTheme>
      </AppContextAuth>
    </AppContextQuery>
  );
};

export default AppContext;
