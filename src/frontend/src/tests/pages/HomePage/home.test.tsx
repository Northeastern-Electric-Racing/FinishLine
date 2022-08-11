/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Home from '../../../pages/HomePage/home';
import { useAuth } from '../../../hooks/auth.hooks';
import { Auth } from '../../../utils/types';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';

jest.mock('../../../pages/HomePage/useful-links', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>useful-links</div>;
    }
  };
});

jest.mock('../../../pages/HomePage/upcoming-deadlines', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>upcoming-deadlines</div>;
    }
  };
});

jest.mock('../../../pages/HomePage/work-packages-by-timeline-status', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>work-packages-by-timeline-status</div>;
    }
  };
});

jest.mock('../../../hooks/auth.hooks');

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

  it('renders upcoming deadlines', () => {
    renderComponent();
    expect(screen.getByText('upcoming-deadlines')).toBeInTheDocument();
  });

  it('renders work packages by timeline status', () => {
    renderComponent();
    expect(screen.getByText('work-packages-by-timeline-status')).toBeInTheDocument();
  });
});
