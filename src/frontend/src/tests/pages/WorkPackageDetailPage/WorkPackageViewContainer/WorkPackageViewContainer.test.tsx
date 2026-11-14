/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder, fireEvent } from '../../../test-support/test-utils';
import {
  exampleResearchWorkPackageDetail,
  exampleDesignWorkPackageDetail
} from '../../../test-support/test-data/work-package-details.stub';
import WorkPackageViewContainer from '../../../../pages/WorkPackageDetailPage/WorkPackageViewContainer/WorkPackageViewContainer';
import AppContextUser from '../../../../app/AppContextUser';
import * as userHooks from '../../../../hooks/users.hooks';
import { exampleAuthenticatedAdminUser } from '../../../test-support/test-data/authenticated-user.stub';
import ClarityProvider from '../../../../app/ClarityProvider';

// Sets up the component under test with the desired values and renders it.
const renderComponent = (
  workPackage = exampleDesignWorkPackageDetail,
  allowEdit = true,
  allowActivate = true,
  allowStageGate = true,
  allowDelete = true
) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ClarityProvider>
        <AppContextUser>
          <WorkPackageViewContainer
            workPackage={workPackage}
            enterEditMode={() => null}
            allowEdit={allowEdit}
            allowActivate={allowActivate}
            allowStageGate={allowStageGate}
            allowDelete={allowDelete}
          />
        </AppContextUser>
      </ClarityProvider>
    </RouterWrapper>
  );
};

describe.skip('work package container view', () => {
  beforeEach(() => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedAdminUser);
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

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Activate')).toBeInTheDocument();
    expect(screen.queryByText('Stage Gate')).not.toBeInTheDocument();
  });

  it('renders action menu buttons for active work package', () => {
    renderComponent(exampleResearchWorkPackageDetail);

    expect(screen.getByText('Actions')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Activate')).not.toBeInTheDocument();
    expect(screen.getByText('Stage Gate')).toBeInTheDocument();
  });

  it('disables edit button when not allowed', () => {
    renderComponent(exampleDesignWorkPackageDetail, false);

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.getByText('Edit')).toHaveAttribute('aria-disabled');
  });

  it('disables activate button when not allowed', () => {
    renderComponent(exampleDesignWorkPackageDetail, true, false);

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.getByText('Activate')).toHaveAttribute('aria-disabled');
  });

  it('disables stage gate button when not allowed', () => {
    renderComponent(exampleResearchWorkPackageDetail, true, true, false);

    fireEvent.click(screen.getByText('Actions'));

    expect(screen.getByText('Stage Gate')).toHaveAttribute('aria-disabled');
  });

  it('disables request change button when not allowed', () => {
    renderComponent(exampleResearchWorkPackageDetail, true, true, true, false);

    fireEvent.click(screen.getByText(/Actions/));

    expect(screen.getByText('Request Change')).toHaveAttribute('aria-disabled');
  });
});
