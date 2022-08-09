/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { exampleStandardChangeRequest } from '../../../../test-support/test-data/change-requests.stub';
import { render, screen, routerWrapperBuilder } from '../../../../test-support/test-utils';
import ReviewChangeRequestsView from './review-change-request';

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
        crId={exampleStandardChangeRequest.crId}
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

    expect(
      screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)
    ).toBeInTheDocument();
  });

  it('renders label for textbox', () => {
    renderComponent(true);

    expect(screen.getByLabelText('Additional Comments')).toBeInTheDocument();
  });

  it('renders textbox', () => {
    renderComponent(true);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    renderComponent(true);

    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Deny')).toBeInTheDocument();
  });

  it("doesn't display modal", () => {
    renderComponent(false);

    expect(
      screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)
    ).not.toBeInTheDocument();
  });
});
