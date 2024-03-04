/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, routerWrapperBuilder, screen } from '../test-support/test-utils';
import AppAuthenticated from '../../app/AppAuthenticated';
import { mockGetVersionNumberReturnValue, mockUseSingleUserSettings } from '../test-support/mock-hooks';
import * as miscHooks from '../../hooks/misc.hooks';
import * as authHooks from '../../hooks/auth.hooks';
import * as workPackageHooks from '../../hooks/work-packages.hooks';
import * as userHooks from '../../hooks/users.hooks';
import { mockUseAllWorkPackagesReturnValue } from '../test-support/mock-hooks';
import { mockAuth } from '../test-support/test-data/test-utils.stub';
import { exampleAdminUser } from '../test-support/test-data/users.stub';

vi.mock('../../pages/ProjectsPage/Projects', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>projects page</div>;
    }
  };
});

vi.mock('../../utils/axios');

// Sets up the component under test with the desired values and renders it
const renderComponent = (path?: string, route?: string) => {
  const RouterWrapper = routerWrapperBuilder({ path, route });
  return render(
    <RouterWrapper>
      <AppAuthenticated userId={1} />
    </RouterWrapper>
  );
};

describe.skip('App Authenticated', () => {
  beforeEach(() => {
    vi.spyOn(workPackageHooks, 'useAllWorkPackages').mockReturnValue(mockUseAllWorkPackagesReturnValue([]));
    vi.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(userHooks, 'useSingleUserSettings').mockReturnValue(mockUseSingleUserSettings());
  });

  it('renders nav links', () => {
    renderComponent();
    expect(screen.getByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Projects')).not.toBeInTheDocument();
    expect(screen.getByText('Change Requests')).not.toBeInTheDocument();
  });

  it('can navigate to projects page', () => {
    renderComponent();
    const homeEle: HTMLElement = screen.getByText('Welcome', { exact: false });
    expect(homeEle).toBeInTheDocument();
    fireEvent.click(screen.getByText('Projects'));

    expect(homeEle).not.toBeInTheDocument();
    expect(screen.getByText('projects page')).toBeInTheDocument();
  });
});
