/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/Routes';
import ChangeRequests from '../../../pages/ChangeRequestsPage/ChangeRequests';

jest.mock('../../../pages/ChangeRequestsPage/ChangeRequestsTable', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>change-requests-table</div>;
    }
  };
});

jest.mock('../../../pages/ChangeRequestDetailPage/ChangeRequestDetails', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>change-request-details</div>;
    }
  };
});

jest.mock('../../../pages/CreateChangeRequestPage/CreateChangeRequest', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>create-change-request</div>;
    }
  };
});

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (route: string) => {
  const RouterWrapper = routerWrapperBuilder({ route });
  return render(
    <RouterWrapper>
      <ChangeRequests />
    </RouterWrapper>
  );
};

describe('change request pages', () => {
  it('renders the change requests list page', () => {
    renderComponent(routes.CHANGE_REQUESTS);

    expect(screen.getByText('change-requests-table')).toBeInTheDocument();
  });

  it('renders the change request id title', async () => {
    renderComponent(routes.CHANGE_REQUESTS_BY_ID);

    expect(screen.getByText('change-request-details')).toBeInTheDocument();
  });

  it('renders the new change request form title', async () => {
    renderComponent(routes.CHANGE_REQUESTS_NEW);

    expect(screen.getByText('create-change-request')).toBeInTheDocument();
  });
});
