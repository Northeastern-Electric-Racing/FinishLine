/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, routerWrapperBuilder, screen } from '../test-support/test-utils';
import AppAuthenticated from '../../app/AppAuthenticated';
import * as miscHooks from '../../hooks/misc.hooks';
import { mockGetVersionNumberReturnValue } from '../test-support/mock-hooks';

jest.mock('../../pages/ProjectsPage/Projects', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>projects page</div>;
    }
  };
});

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
    jest.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
    renderComponent();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });

  it('can navigate to projects page', () => {
    jest.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
    renderComponent();

    const homeEle: HTMLElement = screen.getByText('Welcome', { exact: false });
    expect(homeEle).toBeInTheDocument();
    fireEvent.click(screen.getByText('Projects'));

    expect(homeEle).not.toBeInTheDocument();
    expect(screen.getByText('projects page')).toBeInTheDocument();
  });
});
