/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routerWrapperBuilder, fireEvent, render, screen, act } from '../../test-support/test-utils';
import { ChangeRequest, Project } from 'shared';
import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ChangeRequestDetailsView from '../../../pages/ChangeRequestDetailPage/ChangeRequestDetailsView';
import { useSingleProject } from '../../../hooks/projects.hooks';
import { UseQueryResult } from 'react-query';
import { mockAuth, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleProject1 } from '../../test-support/test-data/projects.stub';
import { ToastProvider } from '../../../components/Toast/ToastProvider';
import * as authHooks from '../../../hooks/auth.hooks';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import AppContextUser from '../../../app/AppContextUser';

vi.mock('../../../hooks/projects.hooks');
const mockedUseSingleProject = useSingleProject as jest.Mock<UseQueryResult<Project>>;
const mockSingleProjectHook = (isLoading: boolean, isError: boolean, data?: Project, error?: Error) => {
  mockedUseSingleProject.mockReturnValue(mockUseQueryResult<Project>(isLoading, isError, data, error));
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
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  const actionBtnText = 'Implement Change Request';
  const newPrjBtnText = 'Create New Project';
  const newWPBtnText = 'Create New Work Package';

  it('Implementation actions disabled when not allowed', () => {
    mockSingleProjectHook(false, false, exampleProject1);
    renderComponent(exampleStandardChangeRequest);
    act(() => {
      fireEvent.click(screen.getByText(actionBtnText));
    });
    expect(screen.getByText(newPrjBtnText)).toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).toHaveAttribute('aria-disabled');
  });

  it('Implementation actions enabled when allowed', () => {
    mockSingleProjectHook(false, false, exampleProject1);
    renderComponent(exampleStandardChangeRequest, true);
    act(() => {
      fireEvent.click(screen.getByText(actionBtnText));
    });
    expect(screen.getByText(newPrjBtnText)).not.toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).not.toHaveAttribute('aria-disabled');
  });
});
