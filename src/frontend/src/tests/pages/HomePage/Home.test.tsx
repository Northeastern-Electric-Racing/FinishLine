/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../TestSupport/TestUtils';
import { routes } from '../../../utils/Routes';
import Home from '../../../pages/HomePage/Home';
import { useAuth } from '../../../hooks/Auth.hooks';
import { Auth } from '../../../utils/Types';
import { exampleAdminUser } from '../../TestSupport/TestData/Users.stub';
import { mockAuth } from '../../TestSupport/TestData/TestUtils.stub';

jest.mock('../../../pages/HomePage/UsefulLinks', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>useful-links</div>;
    }
  };
});

jest.mock('../../../pages/HomePage/UpcomingDeadlines', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>upcoming-deadlines</div>;
    }
  };
});

jest.mock('../../../pages/HomePage/WorkPackagesByTimelineStatus', () => {
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
