/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { WorkPackage } from 'shared';
import {
  render,
  screen,
  routerWrapperBuilder,
  act,
  fireEvent
} from '../../test-support/test-utils';
import { Auth } from '../../types';
import { useSingleWorkPackage } from '../../services/work-packages.hooks';
import { useAuth } from '../../services/auth.hooks';
import { mockAuth, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleWorkPackage1 } from '../../test-support/test-data/work-packages.stub';
import { exampleWbsProject1 } from '../../test-support/test-data/wbs-numbers.stub';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import WorkPackagePage from './work-package-page';

jest.mock('../../services/work-packages.hooks');

const mockedUseSingleWorkPackage = useSingleWorkPackage as jest.Mock<UseQueryResult<WorkPackage>>;

const mockSingleWPHook = (
  isLoading: boolean,
  isError: boolean,
  data?: WorkPackage,
  error?: Error
) => {
  mockedUseSingleWorkPackage.mockReturnValue(
    mockUseQueryResult<WorkPackage>(isLoading, isError, data, error)
  );
};

jest.mock('../../services/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
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
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Manager')).not.toBeInTheDocument();
  });

  it('renders the loaded project', () => {
    mockSingleWPHook(false, false, exampleWorkPackage1);
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByText('1.1.1 - Bodywork Concept of Design').length).toEqual(2);
    expect(screen.getByText('Dependencies')).toBeInTheDocument();
    expect(screen.getByText('Expected Activities')).toBeInTheDocument();
    expect(screen.getByText('Deliverables')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles the error with message', () => {
    mockSingleWPHook(
      false,
      true,
      undefined,
      new Error('404 could not find the requested work package')
    );
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
    expect(screen.getByText('404 could not find the requested work package')).toBeInTheDocument();
  });

  it('handles the error with no message', () => {
    mockSingleWPHook(false, true);
    mockAuthHook();
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('work package')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('enables the edit button for non-guest user', () => {
    mockSingleWPHook(false, false, exampleWorkPackage1);
    mockAuthHook(exampleAdminUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeEnabled();
  });

  it('disables the edit button for guest user', () => {
    mockSingleWPHook(false, false, exampleWorkPackage1);
    mockAuthHook(exampleGuestUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeDisabled();
  });
});
