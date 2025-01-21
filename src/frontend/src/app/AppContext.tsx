/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppContextAuth from './AppContextAuth';
import AppContextQuery from './AppContextQuery';
import AppContextTheme from './AppContextTheme';
import AppContextOrganization from './AppOrganizationContext';
import { HomePageProvider } from './HomePageContext';

const AppContext: React.FC = (props) => {
  return (
    <AppContextQuery>
      <AppContextOrganization>
        <AppContextAuth>
          <AppContextTheme>
            <HomePageProvider>{props.children}</HomePageProvider>
          </AppContextTheme>
        </AppContextAuth>
      </AppContextOrganization>
    </AppContextQuery>
  );
};

export default AppContext;
