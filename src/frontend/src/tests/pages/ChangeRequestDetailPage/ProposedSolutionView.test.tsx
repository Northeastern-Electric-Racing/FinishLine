/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../TestSupport/TestUtils';
import { ProposedSolution } from 'shared';
import { exampleAdminUser } from '../../TestSupport/TestData/Users.stub';
import ProposedSolutionView from '../../../pages/ChangeRequestDetailPage/ProposedSolutionView';

const exampleProposedSolution: ProposedSolution = {
  id: '1',
  description: 'Desc 1',
  scopeImpact: 'Scope Impact 1',
  budgetImpact: 11,
  timelineImpact: 111,
  createdBy: exampleAdminUser,
  dateCreated: new Date(),
  approved: true
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionView proposedSolution={exampleProposedSolution} />
    </RouterWrapper>
  );
};

describe('Proposed Solutions View Test Suite', () => {
  it('Renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 1')).toBeInTheDocument();
    expect(screen.getByText('$11')).toBeInTheDocument();
    expect(screen.getByText('111 weeks')).toBeInTheDocument();
  });
});
