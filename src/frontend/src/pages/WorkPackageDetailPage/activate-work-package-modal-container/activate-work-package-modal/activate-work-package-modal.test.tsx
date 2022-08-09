/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../../test-support/test-utils';
import { exampleAllUsers } from '../../../../test-support/test-data/users.stub';
import { exampleWbs1 } from '../../../../test-support/test-data/wbs-numbers.stub';
import ActivateWorkPackageModal from './activate-work-package-modal';
import { wbsPipe } from '../../../../pipes';

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
      <ActivateWorkPackageModal
        modalShow={modalShow}
        onHide={mockHandleHide}
        onSubmit={mockHandleSubmit}
        allUsers={exampleAllUsers}
        wbsNum={exampleWbs1}
      />
    </RouterWrapper>
  );
};

describe('activate work package modal test suite', () => {
  it('renders accept title', () => {
    renderComponent(true);

    expect(screen.queryByText(`Activate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });

  it('renders label for inputs', () => {
    renderComponent(true);

    expect(screen.getByLabelText(/Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lead/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manager/)).toBeInTheDocument();
    expect(screen.getByText(/WP details/)).toBeInTheDocument();
  });

  it('renders form elements', () => {
    renderComponent(true);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toBe(2);
    expect(screen.getAllByRole('radio').length).toBe(2);
  });

  it('renders buttons', () => {
    renderComponent(true);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(screen.queryByText(`Activate #${wbsPipe(exampleWbs1)}`)).not.toBeInTheDocument();
  });
});
