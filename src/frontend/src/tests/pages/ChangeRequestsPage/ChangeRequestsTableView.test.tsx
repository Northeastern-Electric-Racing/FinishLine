/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { ChangeRequest } from 'shared';
import { exampleAllChangeRequests } from '../../TestSupport/TestData/ChangeRequests.stub';
import { booleanPipe, fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import { routerWrapperBuilder } from '../../TestSupport/TestUtils';
import ChangeRequestsTableView, {
  DisplayChangeRequest
} from '../../../pages/ChangeRequestsPage/ChangeRequestsTableView';

// Sets up the component under test with the desired values and renders it.
const renderComponent: (changeRequests?: DisplayChangeRequest[]) => void = (crs) => {
  const RouterWrapper = routerWrapperBuilder({});
  if (!crs) {
    crs = exampleAllChangeRequests.map((cr: ChangeRequest) => {
      return {
        id: cr.crId,
        submitterName: fullNamePipe(cr.submitter),
        wbsNum: wbsPipe(cr.wbsNum),
        type: cr.type,
        dateReviewed: cr.dateReviewed ? cr.dateReviewed.toLocaleDateString() : '',
        accepted: cr.accepted ? booleanPipe(cr.accepted) : '',
        dateImplemented: cr.dateImplemented ? cr.dateImplemented.toLocaleDateString() : ''
      };
    });
  }
  render(
    <RouterWrapper>
      <ChangeRequestsTableView changeRequests={crs!} />
    </RouterWrapper>
  );
};

describe('change requests table view component', () => {
  it('renders the table headers', async () => {
    renderComponent([]);

    expect(screen.getByText(/ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Submitter/i)).toBeInTheDocument();
    expect(screen.getByText(/WBS #/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted/i)).toBeInTheDocument();
  });
});
