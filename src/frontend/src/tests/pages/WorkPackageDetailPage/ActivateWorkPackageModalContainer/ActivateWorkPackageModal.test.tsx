/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { exampleAllUsers } from '../../../test-support/test-data/users.stub';
import { exampleWbs1 } from '../../../test-support/test-data/wbs-numbers.stub';
import ActivateWorkPackageModal from '../../../../pages/WorkPackageDetailPage/ActivateWorkPackageModalContainer/ActivateWorkPackageModal';
import { wbsPipe } from '../../../../utils/pipes';

vi.mock('../../../../hooks/toasts.hooks');

/**
 * Mock function for submitting the form, use if there is additional functionality added while submitting
 */
const mockHandleSubmit = vi.fn();
/**
 * Mock function for hiding the modal, use if there is additional functionality added while canceling
 */
const mockHandleHide = vi.fn();

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
  it('renders all the info', () => {
    renderComponent(true);

    expect(screen.getByText(`Activate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
    expect(screen.getByText(/Date/)).toBeInTheDocument();
    expect(screen.getByText(/WP details/)).toBeInTheDocument();

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(screen.queryByText(`Activate #${wbsPipe(exampleWbs1)}`)).not.toBeInTheDocument();
  });
});
