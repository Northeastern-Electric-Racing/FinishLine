/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult, UseQueryResult } from 'react-query';
import { User } from 'shared';
import { render, routerWrapperBuilder, screen } from '../../../test-support/test-utils';
import { useEditWorkPackage } from '../../../services/work-packages.hooks';
import { exampleWorkPackage1 } from '../../../test-support/test-data/work-packages.stub';
import { useAllUsers, useLogUserIn } from '../../../services/users.hooks';
import {
  mockUseMutationResult,
  mockUseQueryResult
} from '../../../test-support/test-data/test-utils.stub';
import WorkPackageEditContainer from './work-package-edit-container';
import { exampleAllUsers } from '../../../test-support/test-data/users.stub';

jest.mock('../../../services/work-packages.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseEditWorkPackage = useEditWorkPackage as jest.Mock<UseMutationResult>;

const mockEditWorkPackageHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseEditWorkPackage.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

jest.mock('../../../services/users.hooks');

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;

const mockUsersHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
};

const mockedUseLogUserIn = useLogUserIn as jest.Mock<UseMutationResult>;

const mockUseLogUserInHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseLogUserIn.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <WorkPackageEditContainer workPackage={exampleWorkPackage1} exitEditMode={() => null} />
    </RouterWrapper>
  );
};

describe('test suite for WorkPackageEditContainer', () => {
  beforeEach(() => {
    mockUseLogUserInHook(false, false);
  });
  it('renders without crashing', () => {
    mockEditWorkPackageHook(false, false);
    mockUsersHook(false, false, exampleAllUsers);
    renderComponent();
  });

  it('renders page', () => {
    mockEditWorkPackageHook(false, false);
    mockUsersHook(false, false, exampleAllUsers);
    renderComponent();
    expect(screen.getAllByText(exampleWorkPackage1.name, { exact: false }).length).toEqual(2);
    expect(screen.getByText('Work Package Details')).toBeInTheDocument();
  });

  it('renders change request id field', () => {
    mockEditWorkPackageHook(false, false);
    mockUsersHook(false, false, exampleAllUsers);
    renderComponent();
    expect(screen.getByPlaceholderText('Change Request ID #')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockEditWorkPackageHook(false, false);
    mockUsersHook(true, false);
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockEditWorkPackageHook(false, false);
    mockUsersHook(false, true, undefined, new Error('error'));
    renderComponent();
    expect(screen.getByText('error')).toBeInTheDocument();
  });
});
