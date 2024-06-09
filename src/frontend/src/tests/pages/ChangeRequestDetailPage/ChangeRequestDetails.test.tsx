/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { ChangeRequest } from 'shared';
import { Auth } from '../../../utils/types';
import {
  exampleActivationChangeRequest as exActivationCR,
  exampleStandardChangeRequest as exStandardCR
} from '../../test-support/test-data/change-requests.stub';
import {
  exampleAdminUser,
  exampleAdminUser2,
  exampleGuestUser,
  exampleMemberUser
} from '../../test-support/test-data/users.stub';
import { render, screen, routerWrapperBuilder, fireEvent } from '../../test-support/test-utils';
import { mockUseQueryResult, mockAuth } from '../../test-support/test-data/test-utils.stub';
import { useSingleChangeRequest } from '../../../hooks/change-requests.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import ChangeRequestDetails from '../../../pages/ChangeRequestDetailPage/ChangeRequestDetails';

vi.mock('../../../hooks/change-requests.hooks');

const mockedUseSingleChangeRequest = useSingleChangeRequest as jest.Mock<UseQueryResult<ChangeRequest>>;

const mockSingleCRHook = (isLoading: boolean, isError: boolean, data?: ChangeRequest, error?: Error) => {
  mockedUseSingleChangeRequest.mockReturnValue(mockUseQueryResult<ChangeRequest>(isLoading, isError, data, error));
};

vi.mock('../../../hooks/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ChangeRequestDetails />
    </RouterWrapper>
  );
};

describe.skip('change request details container', () => {
  it('renders the change request', () => {
    mockSingleCRHook(false, false, exStandardCR);
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByText(exStandardCR.crId, { exact: false }).length).toEqual(2);
  });

  it('enables review if the user is an admin', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleAdminUser2);
    renderComponent();

    expect(screen.getByText('Review')).not.toHaveAttribute('aria-disabled');
  });

  it("disables review of admin's own change requests", () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleAdminUser);
    renderComponent();

    expect(screen.getByText('Review')).toHaveAttribute('aria-disabled');
  });

  it('disables reviewing change requests for guests', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleGuestUser);
    renderComponent();

    expect(screen.getByText('Review')).toHaveAttribute('aria-disabled');
  });

  it('disables reviewing change requests for member users', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleMemberUser);
    renderComponent();

    expect(screen.getByText('Review')).toHaveAttribute('aria-disabled');
  });

  it('enables implementing if the user is an admin', () => {
    mockSingleCRHook(false, false, exStandardCR);
    mockAuthHook(exampleAdminUser);
    renderComponent();

    fireEvent.click(screen.getByText('Implement Change Request'));
    expect(screen.getByText('Create New Project')).not.toHaveAttribute('disabled');
    expect(screen.getByText('Create New Work Package')).not.toHaveAttribute('disabled');
  });

  it('disables implementing change requests for guests', () => {
    mockSingleCRHook(false, false, exStandardCR);
    mockAuthHook(exampleGuestUser);
    renderComponent();

    fireEvent.click(screen.getByText('Implement Change Request'));
    expect(screen.getByText('Create New Project')).toHaveAttribute('disabled');
    expect(screen.getByText('Create New Work Package')).toHaveAttribute('disabled');
  });
});
