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
import { mockUseUsersFavoriteProjects } from '../../test-support/mock-hooks';

jest.mock('../../../utils/axios');
jest.mock('../../../hooks/toasts.hooks');

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProjectViewContainer project={exampleProject1} enterEditMode={jest.fn} />
    </RouterWrapper>
  );
};

describe('Rendering Project View Container', () => {
  beforeEach(() => {
    jest.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    jest.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    jest.spyOn(userHooks, 'useUsersFavoriteProjects').mockReturnValue(mockUseUsersFavoriteProjects());
    renderComponent();
  });

  it('renders the provided project', () => {
    expect(screen.getAllByText('1.1.0 - Impact Attenuator').length).toEqual(2);
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Work Packages')).toBeInTheDocument();
    expect(screen.getByText('Bodywork Concept of Design')).toBeInTheDocument();
  });

  it('disables the buttons for guest users', () => {
    jest.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleGuestUser);

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
        [WorkPackageStage.Integration]: 'Integration'
      };

      exampleProject1.workPackages.forEach((wp) => {
        if (wp.stage) expect(screen.getByText(statusLabels[wp.stage])).toBeInTheDocument();
      });
    });
  });
});
