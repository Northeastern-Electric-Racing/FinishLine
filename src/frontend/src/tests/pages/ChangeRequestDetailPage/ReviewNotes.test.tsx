/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import { exampleAllChangeRequests, exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import { exampleAppAdminUser } from '../../test-support/test-data/users.stub';
import { render, screen, fireEvent } from '../../test-support/test-utils';
import ReviewNotes from '../../../pages/ChangeRequestDetailPage/ReviewNotes';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: ChangeRequest) => {
  return render(<ReviewNotes reviewer={cr.reviewer} reviewNotes={cr.reviewNotes} dateReviewed={cr.dateReviewed} />);
};

describe('Change request review notes test', () => {
  // [0] = standard, [1] = activation, [2] = stage gate
  const cr: ChangeRequest[] = exampleAllChangeRequests;

  const NO_REVIEW_NOTES_MSG = 'There are no review notes for this change request.';

  it('standard change request render review notes', () => {
    renderComponent(cr[0]);

    expect(screen.getByText('Review Notes')).toBeInTheDocument();
    expect(screen.getByText(cr[0].reviewNotes ? cr[0].reviewNotes! : NO_REVIEW_NOTES_MSG)).toBeInTheDocument();
    expect(screen.getByText(fullNamePipe(exampleAppAdminUser))).toBeInTheDocument();
  });

  it('activation change request render review notes', () => {
    renderComponent(cr[1]);

    expect(screen.getByText('Review Notes')).toBeInTheDocument();
    expect(screen.getByText(cr[1].reviewNotes ? cr[1].reviewNotes! : NO_REVIEW_NOTES_MSG)).toBeInTheDocument();
  });

  it('stage gate change request render review notes', () => {
    renderComponent(cr[2]);

    expect(screen.getByText('Review Notes')).toBeInTheDocument();
    expect(screen.getByText(cr[2].reviewNotes ? cr[2].reviewNotes! : NO_REVIEW_NOTES_MSG)).toBeInTheDocument();
  });

  it('renders tooltip on hover', async () => {
    renderComponent(cr[0]);
    fireEvent.mouseOver(screen.getByText(`${fullNamePipe(exampleAppAdminUser)}—`));

    expect(await screen.findByText(/Reviewed On: /i)).toBeInTheDocument();
  });

  it('renders no date tooltip on hover', async () => {
    renderComponent(cr[2]);
    fireEvent.mouseOver(screen.getByText('——'));

    expect(await screen.findByText('Reviewed on: —')).toBeInTheDocument();
  });

  it('renders review date tooltip on hover', async () => {
    renderComponent(cr[0]);
    fireEvent.mouseOver(screen.getByText(`${fullNamePipe(exampleAppAdminUser)}—`));

    expect(
      await screen.findByText(`Reviewed on: ${datePipe(exampleStandardChangeRequest.dateReviewed!)}`)
    ).toBeInTheDocument();
  });
});
