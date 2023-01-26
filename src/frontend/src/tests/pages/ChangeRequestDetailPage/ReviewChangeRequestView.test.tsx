/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import ReviewChangeRequestsView from '../../../pages/ChangeRequestDetailPage/ReviewChangeRequestView';

jest.mock('../../../hooks/toasts.hooks');

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
      <ReviewChangeRequestsView
        cr={exampleStandardChangeRequest}
        modalShow={modalShow}
        onHide={mockHandleHide}
        onSubmit={mockHandleSubmit}
      />
    </RouterWrapper>
  );
};

describe('review change request page test suite', () => {
  it('renders accept title', () => {
    renderComponent(true);

    expect(screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)).toBeInTheDocument();
    expect(screen.getByText('Additional Comments')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Deny')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)).not.toBeInTheDocument();
  });
});
