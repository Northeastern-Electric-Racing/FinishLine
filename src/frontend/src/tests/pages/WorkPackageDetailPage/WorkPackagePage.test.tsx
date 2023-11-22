/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { AuthenticatedUser, WorkPackage } from 'shared';
import { render, screen, routerWrapperBuilder, act, fireEvent } from '../../test-support/test-utils';
import { Auth } from '../../../utils/types';
import { useGetManyWorkPackages, useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import { mockAuth, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleDesignWorkPackage, exampleResearchWorkPackage } from '../../test-support/test-data/work-packages.stub';
import { exampleWbsProject1 } from '../../test-support/test-data/wbs-numbers.stub';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import WorkPackagePage from '../../../pages/WorkPackageDetailPage/WorkPackagePage';
import AppContextUser from '../../../app/AppContextUser';
import { useCurrentUser } from '../../../hooks/users.hooks';

vi.mock('../../../hooks/work-packages.hooks');

const mockedUseSingleWorkPackage = useSingleWorkPackage as jest.Mock<UseQueryResult<WorkPackage>>;

const mockSingleWPHook = (isLoading: boolean, isError: boolean, data?: WorkPackage, error?: Error) => {
  mockedUseSingleWorkPackage.mockReturnValue(mockUseQueryResult<WorkPackage>(isLoading, isError, data, error));
};

const mockedGetBlockingWorkPackages = useGetManyWorkPackages as jest.Mock<UseQueryResult<WorkPackage[]>>;

const mockGetBlockingWorkPackagesHook = (isLoading: boolean, isError: boolean, data?: WorkPackage[], error?: Error) => {
  mockedGetBlockingWorkPackages.mockReturnValue(mockUseQueryResult<WorkPackage[]>(isLoading, isError, data, error));
};

vi.mock('../../../hooks/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

vi.mock('../../../hooks/users.hooks');

const mockedUseCurrentUser = useCurrentUser as jest.Mock<AuthenticatedUser>;

const mockCurrentUserHook = (user = exampleAdminUser) => {
  mockedUseCurrentUser.mockReturnValue(user);
};

const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <AppContextUser>
        <WorkPackagePage wbsNum={exampleWbsProject1} />
      </AppContextUser>
    </RouterWrapper>
  );
};

describe('work package container', () => {
  it('renders the loading indicator', () => {
    mockSingleWPHook(true, false);
    mockAuthHook();
    mockCurrentUserHook();
    mockGetBlockingWorkPackagesHook(true, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Manager')).not.toBeInTheDocument();
  });

  it('renders the loaded project', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackage);
    mockAuthHook();
    mockCurrentUserHook();
    mockGetBlockingWorkPackagesHook(false, false, [exampleDesignWorkPackage]);
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
    mockGetBlockingWorkPackagesHook(false, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
    expect(screen.getByText('404 could not find the requested work package')).toBeInTheDocument();
  });

  it('handles the error with no message', () => {
    mockSingleWPHook(false, true);
    mockAuthHook();
    mockCurrentUserHook();
    mockGetBlockingWorkPackagesHook(false, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('work package')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('enables the edit button for non-guest user', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackage);
    mockAuthHook(exampleAdminUser);
    mockCurrentUserHook();
    mockGetBlockingWorkPackagesHook(false, false, [exampleDesignWorkPackage]);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeEnabled();
  });

  it('disables the edit button for guest user', () => {
    mockSingleWPHook(false, false, exampleResearchWorkPackage);
    mockAuthHook(exampleGuestUser);
    mockCurrentUserHook(exampleGuestUser);
    mockGetBlockingWorkPackagesHook(false, false, [exampleDesignWorkPackage]);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toHaveAttribute('aria-disabled');
  });
});
