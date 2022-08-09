/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../routes';
import Home from './home';
import { useAuth } from '../../services/auth.hooks';
import { Auth } from '../../types';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';

jest.mock('./useful-links/useful-links', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>useful-links</div>;
    }
  };
});

jest.mock('./upcoming-deadlines/upcoming-deadlines', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>upcoming-deadlines</div>;
    }
  };
});

jest.mock('./work-packages-by-timeline-status/work-packages-by-timeline-status', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>work-packages-by-timeline-status</div>;
    }
  };
});

jest.mock('../../services/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.HOME, route: routes.HOME });
  return render(
    <RouterWrapper>
      <Home />
    </RouterWrapper>
  );
};

describe('home component', () => {
  beforeEach(() => {
    mockAuthHook();
  });

  it('renders welcome', () => {
    renderComponent();
    expect(screen.getByText(`Welcome, ${exampleAdminUser.firstName}!`)).toBeInTheDocument();
  });

  it('renders useful links', () => {
    renderComponent();
    expect(screen.getByText('useful-links')).toBeInTheDocument();
  });
});
