/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder, act, fireEvent } from '../../../test-support/test-utils';
import { exampleResearchWorkPackage, exampleDesignWorkPackage } from '../../../test-support/test-data/work-packages.stub';
import WorkPackageViewContainer from '../../../../pages/WorkPackageDetailPage/WorkPackageViewContainer/WorkPackageViewContainer';
import * as wpHooks from '../../../../hooks/work-packages.hooks';
import { exampleAdminUser } from '../../../test-support/test-data/users.stub';
import AppContextUser from '../../../../app/AppContextUser';
import * as userHooks from '../../../../hooks/users.hooks';
import { mockManyWorkPackages } from '../../../test-support/mock-hooks';

// Sets up the component under test with the desired values and renders it.
const renderComponent = (
  workPackage = exampleDesignWorkPackage,
  allowEdit = true,
  allowActivate = true,
  allowStageGate = true,
  allowRequestChange = true,
  allowDelete = true
) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <AppContextUser>
        <WorkPackageViewContainer
          workPackage={workPackage}
          enterEditMode={() => null}
          allowEdit={allowEdit}
          allowActivate={allowActivate}
          allowStageGate={allowStageGate}
          allowRequestChange={allowRequestChange}
          allowDelete={allowDelete}
        />
      </AppContextUser>
    </RouterWrapper>
  );
};

describe.skip('work package container view', () => {
  beforeEach(() => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(wpHooks, 'useGetManyWorkPackages').mockReturnValue(mockManyWorkPackages([exampleResearchWorkPackage]));
  });

  it('renders the project', () => {
    renderComponent();

    expect(screen.getAllByText('1.1.2 - Adhesive Shear Strength Test').length).toEqual(2);
    expect(screen.getByText('Blocked By')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeEnabled();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('renders action menu buttons for inactive work package', () => {
    renderComponent();

    expect(screen.getByText('Actions')).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Activate')).toBeInTheDocument();
    expect(screen.queryByText('Stage Gate')).not.toBeInTheDocument();
  });

  it('renders action menu buttons for active work package', () => {
    renderComponent(exampleResearchWorkPackage);

    expect(screen.getByText('Actions')).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Activate')).not.toBeInTheDocument();
    expect(screen.queryByText('Stage Gate')).toBeInTheDocument();
  });

  it('disables edit button when not allowed', () => {
    renderComponent(exampleDesignWorkPackage, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toHaveAttribute('aria-disabled');
  });

  it('disables activate button when not allowed', () => {
    renderComponent(exampleDesignWorkPackage, true, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Activate')).toHaveAttribute('aria-disabled');
  });

  it('disables stage gate button when not allowed', () => {
    renderComponent(exampleResearchWorkPackage, true, true, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Stage Gate')).toHaveAttribute('aria-disabled');
  });

  it('disables request change button when not allowed', () => {
    renderComponent(exampleResearchWorkPackage, true, true, true, false);

    act(() => {
      fireEvent.click(screen.getByText(/Actions/));
    });
    expect(screen.getByText('Request Change')).toHaveAttribute('aria-disabled');
  });
});
