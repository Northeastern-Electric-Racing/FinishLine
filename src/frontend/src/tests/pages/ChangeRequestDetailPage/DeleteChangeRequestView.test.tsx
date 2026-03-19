/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import DeleteChangeRequestsView from '../../../pages/ChangeRequestDetailPage/DeleteChangeRequestView';

vi.mock('../../../hooks/toasts.hooks');

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
      <DeleteChangeRequestsView
        changeRequest={exampleStandardChangeRequest}
        modalShow={modalShow}
        onHide={mockHandleHide}
        onSubmit={mockHandleSubmit}
      />
    </RouterWrapper>
  );
};

describe('delete change request page test suite', () => {
  it('renders text correctly', () => {
    renderComponent(true);
    expect(screen.getByText(`Delete Change Request #${exampleStandardChangeRequest.crId}`)).toBeInTheDocument();
    expect(
      screen.getByText(`Are you sure you want to delete Change Request #${exampleStandardChangeRequest.crId}?`)
    ).toBeInTheDocument();
    expect(screen.getByText(`This action cannot be undone!`)).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);
    expect(screen.queryByText(`Delete Change Request #${exampleStandardChangeRequest.crId}`)).not.toBeInTheDocument();
    expect(
      screen.queryByText(`Are you sure you want to delete Change Request #${exampleStandardChangeRequest.crId}?`)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(`This action cannot be undone!`)).not.toBeInTheDocument();
  });
});
