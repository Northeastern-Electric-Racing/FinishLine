/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AppContextAuth from './AppContextAuth';
import AppContextQuery from './AppContextQuery';
import AppContextTheme from './AppContextTheme';
import AppContextOrganization from './AppOrganizationContext';
import { HomePageProvider } from './HomePageContext';
import { GlobalCarFilterProvider } from './AppGlobalCarFilterContext';

const AppContext: React.FC = (props) => {
  return (
    <AppContextQuery>
      <AppContextOrganization>
        <AppContextAuth>
          <AppContextTheme>
            <GlobalCarFilterProvider>
              <HomePageProvider>{props.children}</HomePageProvider>
            </GlobalCarFilterProvider>
          </AppContextTheme>
        </AppContextAuth>
      </AppContextOrganization>
    </AppContextQuery>
  );
};

export default AppContext;
