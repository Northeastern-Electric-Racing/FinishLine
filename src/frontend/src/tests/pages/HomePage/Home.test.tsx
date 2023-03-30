/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Home from '../../../pages/HomePage/Home';
import * as authHooks from '../../../hooks/auth.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';

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
    jest.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  afterAll(() => jest.clearAllMocks());

  it('renders welcome', () => {
    renderComponent();
  });
});
