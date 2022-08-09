/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { ChangeRequest } from 'shared';
import { Auth } from '../../types';
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
import {
  render,
  screen,
  routerWrapperBuilder,
  act,
  fireEvent
} from '../../test-support/test-utils';
import { mockUseQueryResult, mockAuth } from '../../test-support/test-data/test-utils.stub';
import { useSingleChangeRequest } from '../../services/change-requests.hooks';
import { useAuth } from '../../services/auth.hooks';
import ChangeRequestDetails from './change-request-details';

jest.mock('../../services/change-requests.hooks');

const mockedUseSingleChangeRequest = useSingleChangeRequest as jest.Mock<
  UseQueryResult<ChangeRequest>
>;

const mockSingleCRHook = (
  isLoading: boolean,
  isError: boolean,
  data?: ChangeRequest,
  error?: Error
) => {
  mockedUseSingleChangeRequest.mockReturnValue(
    mockUseQueryResult<ChangeRequest>(isLoading, isError, data, error)
  );
};

jest.mock('../../services/auth.hooks');

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

describe('change request details container', () => {
  it('renders the loading indicator', () => {
    mockSingleCRHook(true, false);
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Date Submitted')).not.toBeInTheDocument();
  });

  it('handles the error with message', () => {
    mockSingleCRHook(
      false,
      true,
      undefined,
      new Error('404 could not find the requested change request')
    );
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
    expect(screen.getByText('404 could not find the requested change request')).toBeInTheDocument();
  });

  it('handles the error with no message', () => {
    mockSingleCRHook(false, true, undefined);
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Change Request')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('enables review if the user is an admin', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleAdminUser2);
    renderComponent();

    expect(screen.getByText('Review')).not.toBeDisabled();
  });

  it('disables reviewing change requests for guests', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleGuestUser);
    renderComponent();

    expect(screen.getByText('Review')).toBeDisabled();
  });

  it('disables reviewing change requests for member users', () => {
    mockSingleCRHook(false, false, exActivationCR);
    mockAuthHook(exampleMemberUser);
    renderComponent();

    expect(screen.getByText('Review')).toBeDisabled();
  });

  it('enables implementing if the user is an admin', () => {
    mockSingleCRHook(false, false, exStandardCR);
    mockAuthHook(exampleAdminUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Implement Change Request'));
    });
    expect(screen.getByText('Create New Project')).not.toHaveAttribute('disabled');
    expect(screen.getByText('Create New Work Package')).not.toHaveAttribute('disabled');
  });

  it('disables implementing change requests for guests', () => {
    mockSingleCRHook(false, false, exStandardCR);
    mockAuthHook(exampleGuestUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Implement Change Request'));
    });
    expect(screen.getByText('Create New Project')).toHaveAttribute('disabled');
    expect(screen.getByText('Create New Work Package')).toHaveAttribute('disabled');
  });
});
