/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../../test-support/test-utils';
import { wbsPipe } from '../../../../pipes';
import { exampleAllUsers } from '../../../../test-support/test-data/users.stub';
import { exampleWbs1 } from '../../../../test-support/test-data/wbs-numbers.stub';
import StageGateWorkPackageModal from './stage-gate-work-package-modal';

/**
 * Mock function for submitting the form, use if there is additional functionality added while submitting
 */
const mockHandleSubmit = jest.fn();
/**
 * Mock function for hiding the modal, use if there is additional functionality added while canceling
 */
const mockHandleHide = jest.fn();

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (modalShow: boolean) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <StageGateWorkPackageModal
        modalShow={modalShow}
        onHide={mockHandleHide}
        onSubmit={mockHandleSubmit}
        allUsers={exampleAllUsers}
        wbsNum={exampleWbs1}
      />
    </RouterWrapper>
  );
};

describe('stage gate work package modal test suite', () => {
  it('renders accept title', () => {
    renderComponent(true);

    expect(screen.queryByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });

  it('renders label for inputs', () => {
    renderComponent(true);

    expect(screen.getByLabelText(/Budget/)).toBeInTheDocument();
    expect(screen.getByText(/done/)).toBeInTheDocument();
  });

  it('renders form elements', () => {
    renderComponent(true);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getAllByRole('radio').length).toBe(2);
  });

  it('renders buttons', () => {
    renderComponent(true);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(screen.queryByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).not.toBeInTheDocument();
  });
});
