/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, routerWrapperBuilder, screen } from '../test-support/test-utils';
import AppAuthenticated from '../../app/AppAuthenticated';
import * as miscHooks from '../../hooks/misc.hooks';
import { mockGetVersionNumberReturnValue } from '../test-support/mock-hooks';
import * as workPackageHooks from '../../hooks/work-packages.hooks';
import { mockUseAllWorkPackagesReturnValue } from '../test-support/mock-hooks';

jest.mock('../../pages/ProjectsPage/Projects', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>projects page</div>;
    }
  };
});

jest.mock('../../utils/axios');

// Sets up the component under test with the desired values and renders it
const renderComponent = (path?: string, route?: string) => {
  const RouterWrapper = routerWrapperBuilder({ path, route });
  return render(
    <RouterWrapper>
      <AppAuthenticated />
    </RouterWrapper>
  );
};

describe('AppAuthenticated', () => {
  beforeEach(() => {
    jest.spyOn(workPackageHooks, 'useAllWorkPackages').mockReturnValue(mockUseAllWorkPackagesReturnValue([]));
    jest.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
  });

  it('renders nav links', () => {
    renderComponent();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });

  it('can navigate to projects page', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Projects'));

    expect(screen.getByText('projects page')).toBeInTheDocument();
  });
});
