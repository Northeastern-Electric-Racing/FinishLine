/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  render,
  screen,
  routerWrapperBuilder,
  act,
  fireEvent
} from '../../../test-support/test-utils';
import {
  exampleWorkPackage1,
  exampleWorkPackage2
} from '../../../test-support/test-data/work-packages.stub';
import WorkPackageViewContainer from './work-package-view-container';

// Sets up the component under test with the desired values and renders it.
const renderComponent = (
  workPackage = exampleWorkPackage2,
  allowEdit = true,
  allowActivate = true,
  allowStageGate = true,
  allowRequestChange = true
) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <WorkPackageViewContainer
        workPackage={workPackage}
        enterEditMode={() => null}
        allowEdit={allowEdit}
        allowActivate={allowActivate}
        allowStageGate={allowStageGate}
        allowRequestChange={allowRequestChange}
      />
    </RouterWrapper>
  );
};

describe('work package container view', () => {
  it('renders the project', () => {
    renderComponent();

    expect(screen.getAllByText('1.1.2 - Adhesive Shear Strength Test').length).toEqual(2);
    expect(screen.getByText('Dependencies')).toBeInTheDocument();
    expect(screen.getByText('Expected Activities')).toBeInTheDocument();
    expect(screen.getByText('Deliverables')).toBeInTheDocument();
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
    renderComponent(exampleWorkPackage1);

    expect(screen.getByText('Actions')).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Activate')).not.toBeInTheDocument();
    expect(screen.queryByText('Stage Gate')).toBeInTheDocument();
  });

  it('disables edit button when not allowed', () => {
    renderComponent(exampleWorkPackage2, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toBeDisabled();
  });

  it('disables activate button when not allowed', () => {
    renderComponent(exampleWorkPackage2, true, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Activate')).toBeDisabled();
  });

  it('disables stage gate button when not allowed', () => {
    renderComponent(exampleWorkPackage1, true, true, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Stage Gate')).toBeDisabled();
  });

  it('disables request change button when not allowed', () => {
    renderComponent(exampleWorkPackage1, true, true, true, false);

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Request Change')).toHaveClass('disabled');
  });
});
