/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../TestSupport/TestUtils';
import ProposedSolutionsList from '../../../pages/ChangeRequestDetailPage/ProposedSolutionsList';
import { ProposedSolution } from 'shared';
import { exampleAdminUser, exampleLeadershipUser } from '../../TestSupport/TestData/Users.stub';

const exampleProposedSolution1: ProposedSolution = {
  id: '1',
  description: 'Desc 1',
  scopeImpact: 'Scope Impact 1',
  budgetImpact: 11,
  timelineImpact: 111,
  createdBy: exampleAdminUser,
  dateCreated: new Date(),
  approved: true
};

const exampleProposedSolution2: ProposedSolution = {
  id: '2',
  description: 'Desc 2',
  scopeImpact: 'Scope Impact 2',
  budgetImpact: 22,
  timelineImpact: 222,
  createdBy: exampleLeadershipUser,
  dateCreated: new Date(),
  approved: false
};

const exampleProposedSolutions = [exampleProposedSolution1, exampleProposedSolution2];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (proposedSolutions: ProposedSolution[] = []) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionsList proposedSolutions={proposedSolutions} />
    </RouterWrapper>
  );
};

describe('Proposed Solutions List Test Suite', () => {
  it('Renders correctly when not empty', () => {
    renderComponent(exampleProposedSolutions);
    expect(screen.getByText('+ Add Proposed Solution')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Scope Impact 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('11')).toBeInTheDocument();
    expect(screen.getByDisplayValue('111')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Scope Impact 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('22')).toBeInTheDocument();
    expect(screen.getByDisplayValue('222')).toBeInTheDocument();
  });

  it('Renders correctly when empty', () => {
    renderComponent();
    expect(screen.getByText('+ Add Proposed Solution')).toBeInTheDocument();
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 1')).not.toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();
    expect(screen.queryByText('111')).not.toBeInTheDocument();
    expect(screen.queryByText('Desc 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 2')).not.toBeInTheDocument();
    expect(screen.queryByText('22')).not.toBeInTheDocument();
    expect(screen.queryByText('222')).not.toBeInTheDocument();
  });

  it('Fires Modal correctly', () => {
    renderComponent();
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Timeline Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    screen.getByText('+ Add Proposed Solution').click();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
