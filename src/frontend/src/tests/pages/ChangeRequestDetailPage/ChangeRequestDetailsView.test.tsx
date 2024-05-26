/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routerWrapperBuilder, fireEvent, render, screen } from '../../test-support/test-utils';
import { ChangeRequest, Project, User } from 'shared';
import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ChangeRequestDetailsView from '../../../pages/ChangeRequestDetailPage/ChangeRequestDetailsView';
import { useSingleProject } from '../../../hooks/projects.hooks';
import { UseMutationResult, UseQueryResult } from 'react-query';
import { mockAuth, mockUseMutationResult, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleProject1 } from '../../test-support/test-data/projects.stub';
import { ToastProvider } from '../../../components/Toast/ToastProvider';
import * as authHooks from '../../../hooks/auth.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import AppContextUser from '../../../app/AppContextUser';
import { useAllUsers, useLogUserIn } from '../../../hooks/users.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import { mockLogUserInReturnValue, mockLogUserInDevReturnValue } from '../../test-support/mock-hooks';

vi.mock('../../../hooks/projects.hooks');
vi.mock('../../../hooks/users.hooks');

const mockedUseSingleProject = useSingleProject as jest.Mock<UseQueryResult<Project>>;
const mockSingleProjectHook = (isLoading: boolean, isError: boolean, data?: Project, error?: Error) => {
  mockedUseSingleProject.mockReturnValue(mockUseQueryResult<Project>(isLoading, isError, data, error));
};

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;
const mockAllUsersHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
};

const mockedUseLogUserIn = useLogUserIn as jest.Mock<UseMutationResult>;
const mockUseLogUserInHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseLogUserIn.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: ChangeRequest, allowed: boolean = false) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <AppContextUser>
      <ToastProvider>
        <RouterWrapper>
          <ChangeRequestDetailsView
            changeRequest={cr}
            isUserAllowedToReview={allowed}
            isUserAllowedToImplement={allowed}
            isUserAllowedToDelete={allowed}
          />
        </RouterWrapper>
      </ToastProvider>
    </AppContextUser>
  );
};

describe('Implement change request permission tests', () => {
  beforeEach(() => {
    vi.spyOn(userHooks, 'useLogUserIn').mockReturnValue(mockLogUserInReturnValue);
    vi.spyOn(userHooks, 'useLogUserInDev').mockReturnValue(mockLogUserInDevReturnValue);
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  const actionBtnText = 'Implement Change Request';
  const newPrjBtnText = 'Create New Project';
  const newWPBtnText = 'Create New Work Package';

  it('Implementation actions disabled when not allowed', () => {
    mockSingleProjectHook(false, false, exampleProject1);
    mockAllUsersHook(false, false, []);
    mockUseLogUserInHook(false, false);
    renderComponent(exampleStandardChangeRequest);
    fireEvent.click(screen.getByText(actionBtnText));
    expect(screen.getByText(newPrjBtnText)).toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).toHaveAttribute('aria-disabled');
  });

  it('Implementation actions enabled when allowed', () => {
    mockSingleProjectHook(false, false, exampleProject1);
    mockAllUsersHook(false, false, []);
    mockUseLogUserInHook(false, false);
    renderComponent(exampleStandardChangeRequest, true);
    fireEvent.click(screen.getByText(actionBtnText));
    expect(screen.getByText(newPrjBtnText)).not.toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).not.toHaveAttribute('aria-disabled');
  });
});
