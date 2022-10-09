/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult, UseQueryResult } from 'react-query';
import { User } from 'shared';
import { render, screen } from '../../../TestSupport/TestUtils';
import { wbsPipe } from '../../../../utils/Pipes';
import { useAllUsers, useLogUserIn } from '../../../../hooks/Users.hooks';
import { exampleWbs1 } from '../../../TestSupport/TestData/WbsNumbers.stub';
import ActivateWorkPackageModalContainer from '../../../../pages/WorkPackageDetailPage/ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import {
  mockUseMutationResult,
  mockUseQueryResult
} from '../../../TestSupport/TestData/TestUtils.stub';
import { useCreateActivationChangeRequest } from '../../../../hooks/ChangeRequests.hooks';
import { exampleAllUsers } from '../../../TestSupport/TestData/Users.stub';

jest.mock('../../../../hooks/Users.hooks');

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;

const mockUseAllUsersHook = (isLoading = false, isError = false, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult(isLoading, isError, data, error));
};

const mockedUseLogUserIn = useLogUserIn as jest.Mock<UseMutationResult>;

const mockUseLogUserInHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseLogUserIn.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

jest.mock('../../../../hooks/ChangeRequests.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseCreateActivationCR =
  useCreateActivationChangeRequest as jest.Mock<UseMutationResult>;

const mockUseCreateActivationCRHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseCreateActivationCR.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

const renderComponent = () => {
  return render(
    <ActivateWorkPackageModalContainer
      modalShow={true}
      handleClose={() => null}
      wbsNum={exampleWbs1}
    />
  );
};

describe('activate work package modal container test suite', () => {
  beforeEach(() => {
    mockUseLogUserInHook(false, false);
  });

  it('renders component without crashing', () => {
    mockUseAllUsersHook(false, false, exampleAllUsers);
    mockUseCreateActivationCRHook(false, false);
    renderComponent();

    expect(screen.getByText(`Activate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });

  it('renders loading indicator when loading', () => {
    mockUseAllUsersHook(true, false);
    mockUseCreateActivationCRHook(true, false);
    renderComponent();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error page when error', () => {
    mockUseAllUsersHook(false, true, exampleAllUsers);
    mockUseCreateActivationCRHook(false, true, new Error('some error'));
    renderComponent();

    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });
});
