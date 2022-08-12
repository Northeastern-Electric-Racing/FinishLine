/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../TestSupport/TestUtils';
import { ImplementedChange } from 'shared';
import { exampleStandardImplementedChangeRequest } from '../../TestSupport/TestData/ChangeRequests.stub';
import ImplementedChangesList from '../../../pages/ChangeRequestDetailPage/ImplementedChangesList';

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
  it('renders the component title', () => {
    renderComponent();

    expect(screen.getByText(`Implemented Changes`)).toBeInTheDocument();
  });

  it('renders the implemented changes list', () => {
    renderComponent(exampleStandardImplementedChangeRequest.implementedChanges);

    expect(screen.getByText('1.23.3')).toBeInTheDocument();
    expect(screen.getByText(/Increase budget to 200/i)).toBeInTheDocument();
    expect(screen.getByText('1.23.4')).toBeInTheDocument();
    expect(screen.getByText(/Adjust description/i)).toBeInTheDocument();
  });

  it('renders the overall date implemented', () => {
    renderComponent([], new Date('2020-01-02'));

    expect(screen.getByText('01/02/2020')).toBeInTheDocument();
  });
});
