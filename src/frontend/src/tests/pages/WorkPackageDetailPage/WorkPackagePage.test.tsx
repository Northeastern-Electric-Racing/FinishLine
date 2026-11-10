/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { AuthenticatedUser, WorkPackageDetail } from 'shared';
import { render, screen, routerWrapperBuilder, fireEvent } from '../../test-support/test-utils';
import { Auth } from '../../../utils/types';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import { mockAuth, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleResearchWorkPackageDetail } from '../../test-support/test-data/work-package-details.stub';
import { exampleWbsProject1 } from '../../test-support/test-data/wbs-numbers.stub';
import WorkPackagePage from '../../../pages/WorkPackageDetailPage/WorkPackagePage';
import { useCurrentUser } from '../../../hooks/users.hooks';
import {
  exampleAuthenticatedAdminUser,
  exampleAuthenticatedGuestUser
} from '../../test-support/test-data/authenticated-user.stub';

vi.mock('../../../hooks/work-packages.hooks');

const mockedUseSingleWorkPackage = useSingleWorkPackage as jest.Mock<UseQueryResult<WorkPackageDetail>>;

const mockSingleWPHook = (isLoading: boolean, isError: boolean, data?: WorkPackageDetail, error?: Error) => {
  mockedUseSingleWorkPackage.mockReturnValue(mockUseQueryResult<WorkPackageDetail>(isLoading, isError, data, error));
};

vi.mock('../../../hooks/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAuthenticatedAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

vi.mock('../../../hooks/users.hooks');

const mockedUseCurrentUser = useCurrentUser as jest.Mock<AuthenticatedUser>;

const mockCurrentUserHook = (user = exampleAuthenticatedAdminUser) => {
  mockedUseCurrentUser.mockReturnValue({ ...user, organizations: [], onboardedTeamTypeIds: [], onboardingTeamTypeIds: [] });
};

const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <WorkPackagePage wbsNum={exampleWbsProject1} />
    </RouterWrapper>
  );
};

describe('work package container', () => {
  it('renders the loading indicator', () => {
    mockSingleWPHook(true, false);
    mockAuthHook();
    mockCurrentUserHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Manager')).not.toBeInTheDocument();
  });

  it('renders the loaded project', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackageDetail);
    mockAuthHook();
    mockCurrentUserHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByText('1.1.1 - Bodywork Concept of Design').length).toEqual(2);
    expect(screen.getByText('Blocked By')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles the error with message', () => {
    mockSingleWPHook(false, true, undefined, new Error('404 could not find the requested work package'));
    mockAuthHook();
    mockCurrentUserHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles the error with no message', () => {
    mockSingleWPHook(false, true);
    mockAuthHook();
    mockCurrentUserHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('enables the edit button for non-guest user', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackageDetail);
    mockAuthHook(exampleAuthenticatedAdminUser);
    mockCurrentUserHook();
    renderComponent();

    fireEvent.click(screen.getByText('Actions'));
    expect(screen.getByText('Edit')).toBeEnabled();
  });

  it('disables the edit button for guest user', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackageDetail);
    mockAuthHook(exampleAuthenticatedGuestUser);
    mockCurrentUserHook(exampleAuthenticatedGuestUser);
    renderComponent();

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.queryByText('Edit')).toBeNull();
  });
});
