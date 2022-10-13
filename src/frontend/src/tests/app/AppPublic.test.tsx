/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { render, screen, routerWrapperBuilder } from '../test-support/test-utils';
import { exampleAdminUser } from '../test-support/test-data/users.stub';
import { mockAuth } from '../test-support/test-data/test-utils.stub';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/Routes';
import { Auth } from '../../utils/Types';
import AppPublic from '../../app/AppPublic';

jest.mock('../../app/AppAuthenticated', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>app-authenticated</div>;
    }
  };
});

jest.mock('../../hooks/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockHook = (isLoading: boolean, user?: User) => {
  mockedUseAuth.mockReturnValue(mockAuth(isLoading, user));
};

// Sets up the component under test with the desired values and renders it
const renderComponent = (path?: string, route?: string) => {
  const RouterWrapper = routerWrapperBuilder({ path, route });
  return render(
    <RouterWrapper>
      <AppPublic />
    </RouterWrapper>
  );
};

describe('app public section', () => {
  it('renders loading spinner', () => {
    mockHook(true, exampleAdminUser);
    renderComponent(routes.LOGIN, routes.LOGIN);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders app authenticated', () => {
    mockHook(false, exampleAdminUser);
    renderComponent(routes.PROJECTS, routes.PROJECTS);

    expect(screen.getByText('app-authenticated')).toBeInTheDocument();
  });
});
