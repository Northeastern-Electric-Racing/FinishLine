/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, routerWrapperBuilder, screen } from '../test-support/test-utils';
import AppAuthenticated from '../../app/AppAuthenticated';
import { useGetVersionNumber } from '../../hooks/misc.hooks';
import { UseQueryResult } from 'react-query';
import { VersionObject } from '../../utils/types';
import { mockUseQueryResult } from '../test-support/test-data/test-utils.stub';

jest.mock('../../pages/ProjectsPage/Projects', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>projects page</div>;
    }
  };
});

jest.mock('../../hooks/misc.hooks');

const mockedUseGetVersionNumber = useGetVersionNumber as jest.Mock<UseQueryResult<VersionObject>>;

const mockHook = (isLoading: boolean, isError: boolean, data?: VersionObject, error?: Error) => {
  mockedUseGetVersionNumber.mockReturnValue(mockUseQueryResult<VersionObject>(isLoading, isError, data, error));
};

// Sets up the component under test with the desired values and renders it
const renderComponent = (path?: string, route?: string) => {
  const RouterWrapper = routerWrapperBuilder({ path, route });
  return render(
    <RouterWrapper>
      <AppAuthenticated />
    </RouterWrapper>
  );
};

describe('app authenticated section', () => {
  it('renders nav links', () => {
    mockHook(false, false, { tag_name: 'v3.5.4' } as VersionObject);
    renderComponent();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });

  it('can navigate to projects page', () => {
    mockHook(false, false, { tag_name: 'v3.5.4' } as VersionObject);
    renderComponent();

    const homeEle: HTMLElement = screen.getByText('Welcome', { exact: false });
    expect(homeEle).toBeInTheDocument();
    fireEvent.click(screen.getByText('Projects'));

    expect(homeEle).not.toBeInTheDocument();
    expect(screen.getByText('projects page')).toBeInTheDocument();
  });
});
