/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { wbsPipe } from '../../../../utils/pipes';
import { exampleWbs1 } from '../../../test-support/test-data/wbs-numbers.stub';
import StageGateWorkPackageModal from '../../../../pages/WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModal';

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
      <StageGateWorkPackageModal
        modalShow={modalShow}
        onHide={mockHandleHide}
        onSubmit={mockHandleSubmit}
        wbsNum={exampleWbs1}
      />
    </RouterWrapper>
  );
};

describe('stage gate work package modal test suite', () => {
  it('renders the info if the modal is shown', () => {
    renderComponent(true);

    expect(screen.getByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
    expect(screen.getByText(/done/)).toBeInTheDocument();
    expect(screen.getAllByRole('radio').length).toBe(2);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(screen.queryByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).not.toBeInTheDocument();
  });
});
