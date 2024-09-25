/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Home from '../../../pages/HomePage/Home';
import * as authHooks from '../../../hooks/auth.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { mockUseSingleUserSettings } from '../../test-support/mock-hooks';

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
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(userHooks, 'useSingleUserSettings').mockReturnValue(mockUseSingleUserSettings());
  });

  afterAll(() => vi.clearAllMocks());
});
