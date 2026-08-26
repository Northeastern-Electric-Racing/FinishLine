/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Home from '../../../pages/HomePage/Home';
import * as authHooks from '../../../hooks/auth.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import * as teamsHooks from '../../../hooks/teams.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { mockUseSingleUserSettings, mockUseGetUsersTeams } from '../../test-support/mock-hooks';
import {
  exampleAuthenticatedAdminUser,
  exampleAuthenticatedNewMemberUser
} from '../../test-support/test-data/authenticated-user.stub';
import { exampleTeam } from '../../test-support/test-data/teams.stub';

vi.mock('../../../app/AppGlobalCarFilterContext', () => ({
  useGlobalCarFilter: () => ({
    selectedCar: 'all-cars',
    allCars: [],
    setSelectedCar: vi.fn(),
    isLoading: false,
    error: null
  })
}));

vi.mock('../../../pages/HomePage/components/UsefulLinks', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>useful-links</div>;
    }
  };
});

vi.mock('../../../pages/HomePage/components/UpcomingDeadlines', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>upcoming-deadlines</div>;
    }
  };
});

vi.mock('../../../pages/HomePage/components/WorkPackagesByTimelineStatus', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>work-packages-by-timeline-status</div>;
    }
  };
});

vi.mock('../../../pages/HomePage/NewMemberHomePage', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>new-member-home</div>;
    }
  };
});

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
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAuthenticatedAdminUser));
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedAdminUser);
    vi.spyOn(userHooks, 'useSingleUserSettings').mockReturnValue(mockUseSingleUserSettings());
    vi.spyOn(teamsHooks, 'useGetUsersTeams').mockReturnValue(mockUseGetUsersTeams());
  });

  afterAll(() => vi.clearAllMocks());

  it('renders welcome', () => {
    renderComponent();
    expect(screen.getByText(`Welcome, ${exampleAdminUser.firstName}!`)).toBeInTheDocument();
  });

  it('renders the new member dashboard for a completed-onboarding guest who has not joined a team', () => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedNewMemberUser);
    vi.spyOn(teamsHooks, 'useGetUsersTeams').mockReturnValue(mockUseGetUsersTeams([]));

    renderComponent();

    expect(screen.getByText('new-member-home')).toBeInTheDocument();
  });

  it('renders the standard dashboard once a completed-onboarding guest has joined a team', () => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedNewMemberUser);
    vi.spyOn(teamsHooks, 'useGetUsersTeams').mockReturnValue(mockUseGetUsersTeams([exampleTeam]));

    renderComponent();

    expect(screen.queryByText('new-member-home')).not.toBeInTheDocument();
  });
});
