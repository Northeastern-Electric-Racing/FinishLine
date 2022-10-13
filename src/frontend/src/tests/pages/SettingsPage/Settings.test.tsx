/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/Routes';
import Settings from '../../../pages/SettingsPage/Settings';

jest.mock('../../../pages/SettingsPage/UserSettings/UserSettings', () => {
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

describe('settings page component', () => {
  it('renders title', () => {
    renderComponent();
    expect(screen.getAllByText('Settings').length).toEqual(2);
  });

  it('renders organization settings', () => {
    renderComponent();
    expect(screen.getByText(/Organization/)).toBeInTheDocument();
  });

  it('renders user', () => {
    renderComponent();
    expect(screen.getByText(/First Name:/)).toBeInTheDocument();
  });

  it('renders email', () => {
    renderComponent();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
  });

  it('renders role', () => {
    renderComponent();
    expect(screen.getByText(/Role:/)).toBeInTheDocument();
  });

  it('renders user settings component', () => {
    renderComponent();
    expect(screen.getByText('user-settings')).toBeInTheDocument();
  });
});
