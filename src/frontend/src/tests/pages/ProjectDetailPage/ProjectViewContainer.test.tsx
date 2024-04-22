/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder, fireEvent, act } from '../../test-support/test-utils';
import { exampleProject1 } from '../../test-support/test-data/projects.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import ProjectViewContainer from '../../../pages/ProjectDetailPage/ProjectViewContainer/ProjectViewContainer';
import { WorkPackageStage } from 'shared/src/types/work-package-types';
import * as userHooks from '../../../hooks/users.hooks';
import * as authHooks from '../../../hooks/auth.hooks';
import * as wpHooks from '../../../hooks/work-packages.hooks';
import { mockManyWorkPackages, mockUseUsersFavoriteProjects } from '../../test-support/mock-hooks';
import { exampleAllWorkPackages } from '../../test-support/test-data/work-packages.stub';

vi.mock('../../../utils/axios');
vi.mock('../../../hooks/toasts.hooks');

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProjectViewContainer project={exampleProject1} enterEditMode={vi.fn} />
    </RouterWrapper>
  );
};

describe('Rendering Project View Container', () => {
  beforeEach(() => {
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(userHooks, 'useUsersFavoriteProjects').mockReturnValue(mockUseUsersFavoriteProjects());
    vi.spyOn(wpHooks, 'useGetManyWorkPackages').mockReturnValue(mockManyWorkPackages(exampleAllWorkPackages));
    renderComponent();
  });

  it('renders the provided project', () => {
    expect(screen.getAllByText('1.1.0 - Impact Attenuator').length).toEqual(1);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Work Packages')).toBeInTheDocument();
    expect(screen.getByText('Bodywork Concept of Design')).toBeInTheDocument();
  });

  it('disables the buttons for guest users', () => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleGuestUser);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Request Change')).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables the buttons for admin users', () => {
    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Request Change')).not.toHaveAttribute('aria-disabled', 'true');
  });

  describe('Work Package Preview', () => {
    it('renders the work package names', () => {
      exampleProject1.workPackages.forEach((wp) => {
        expect(screen.getByText(wp.name)).toBeInTheDocument();
      });
    });

    it('renders the work package statuses', () => {
      // should be the same as textMap in the WorkPackageStageChip component
      const statusLabels: Record<WorkPackageStage, string> = {
        [WorkPackageStage.Research]: 'Research',
        [WorkPackageStage.Design]: 'Design',
        [WorkPackageStage.Manufacturing]: 'Manufacturing',
        [WorkPackageStage.Install]: 'Install',
        [WorkPackageStage.Testing]: 'Testing'
      };

      exampleProject1.workPackages.forEach((wp) => {
        if (wp.stage) expect(screen.getByText(statusLabels[wp.stage])).toBeInTheDocument();
      });
    });
  });
});
