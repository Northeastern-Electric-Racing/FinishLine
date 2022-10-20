/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult } from 'react-query';
import { render, routerWrapperBuilder, screen } from '../../../test-support/test-utils';
import { useEditWorkPackage } from '../../../../hooks/work-packages.hooks';
import { exampleWorkPackage1 } from '../../../test-support/test-data/work-packages.stub';
import * as userHooks from '../../../../hooks/users.hooks';
import { mockUseMutationResult } from '../../../test-support/test-data/test-utils.stub';
import WorkPackageEditContainer from '../../../../pages/WorkPackageDetailPage/WorkPackageEditContainer/WorkPackageEditContainer';
import { exampleAllUsers } from '../../../test-support/test-data/users.stub';
import {
  mockLogUserInReturnValue,
  mockLogUserInDevReturnValue,
  mockUseAllUsersReturnValue
} from '../../../test-support/mock-hooks';

jest.mock('../../../../hooks/work-packages.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseEditWorkPackage = useEditWorkPackage as jest.Mock<UseMutationResult>;

const mockEditWorkPackageHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseEditWorkPackage.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
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
    jest.spyOn(userHooks, 'useLogUserIn').mockReturnValue(mockLogUserInReturnValue);
    jest.spyOn(userHooks, 'useLogUserInDev').mockReturnValue(mockLogUserInDevReturnValue);
    jest.spyOn(userHooks, 'useAllUsers').mockReturnValue(mockUseAllUsersReturnValue(exampleAllUsers));
  });

  it('renders page', () => {
    mockEditWorkPackageHook(false, false);
    renderComponent();
    expect(screen.getAllByText(exampleWorkPackage1.name, { exact: false }).length).toEqual(2);
    expect(screen.getByText('Work Package Details')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Change Request ID #')).toBeInTheDocument();
  });
});
