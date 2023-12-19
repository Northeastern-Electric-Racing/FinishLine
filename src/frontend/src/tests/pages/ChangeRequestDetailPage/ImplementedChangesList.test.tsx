/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { ImplementedChange } from 'shared';
import { exampleStandardImplementedChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ImplementedChangesList from '../../../pages/ChangeRequestDetailPage/ImplementedChangesList';
import { datePipe } from '../../../utils/pipes';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (changes: ImplementedChange[] = [], overallDate?: Date) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ImplementedChangesList changes={changes} overallDateImplemented={overallDate} />
    </RouterWrapper>
  );
};

describe('Rendering Implemented Changes List Component', () => {
  it('renders everything', () => {
    renderComponent(exampleStandardImplementedChangeRequest.implementedChanges);

    expect(
      screen.getByText(`Implemented Changes — ${exampleStandardImplementedChangeRequest.dateImplemented ?? 'N/A'}`)
    ).toBeInTheDocument();
    expect(screen.getByText('1.23.3')).toBeInTheDocument();
    expect(screen.getByText(/Increase budget to 200/i)).toBeInTheDocument();
    expect(screen.getByText('1.23.4')).toBeInTheDocument();
    expect(screen.getByText(/Adjust description/i)).toBeInTheDocument();
  });
});
