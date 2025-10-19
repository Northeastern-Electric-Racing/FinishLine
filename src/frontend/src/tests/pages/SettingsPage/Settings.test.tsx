/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Settings from '../../../pages/SettingsPage/SettingsPage';
import * as authHooks from '../../../hooks/auth.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';

vi.mock('../../../pages/SettingsPage/UserSettings/UserSettings', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>user-settings</div>;
    }
  };
});

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.SETTINGS, route: routes.SETTINGS });
  return render(
    <RouterWrapper>
      <Settings />
    </RouterWrapper>
  );
};

describe.skip('settings page component', () => {
  beforeEach(() => vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser)));
  it('renders all the information', () => {
    renderComponent();
    expect(screen.getAllByText('Settings').length).toEqual(1);
    expect(screen.getByText(/Organization/)).toBeInTheDocument();
    expect(screen.getByText(/First Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText(/Role:/)).toBeInTheDocument();
    expect(screen.getByText('user-settings')).toBeInTheDocument();
  });
});
