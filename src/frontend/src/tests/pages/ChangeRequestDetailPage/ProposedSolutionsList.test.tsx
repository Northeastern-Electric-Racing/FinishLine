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
const renderComponent = (proposedSolutions: ProposedSolution[] = [], crReviewed = false) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionsList proposedSolutions={proposedSolutions} crReviewed={crReviewed} />
    </RouterWrapper>
  );
};

describe('Proposed Solutions List Test Suite', () => {
  it('Renders correctly when not empty', () => {
    renderComponent(exampleProposedSolutions);
    expect(screen.getByText('+ Add Proposed Solution')).toBeInTheDocument();
    expect(screen.getAllByText('Description').length).toBe(2);
    expect(screen.getAllByText('Scope Impact').length).toBe(2);
    expect(screen.getAllByText('Budget Impact').length).toBe(2);
    expect(screen.getAllByText('Timeline Impact').length).toBe(2);
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 1')).toBeInTheDocument();
    expect(screen.getByText('$11')).toBeInTheDocument();
    expect(screen.getByText('111 weeks')).toBeInTheDocument();
    expect(screen.getByText('Desc 2')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 2')).toBeInTheDocument();
    expect(screen.getByText('$22')).toBeInTheDocument();
    expect(screen.getByText('222 weeks')).toBeInTheDocument();
  });

  it('Renders correctly when empty', () => {
    renderComponent();
    expect(screen.getByText('+ Add Proposed Solution')).toBeInTheDocument();
    expect(screen.queryAllByText('Description').length).toBe(0);
    expect(screen.queryAllByText('Scope Impact').length).toBe(0);
    expect(screen.queryAllByText('Budget Impact').length).toBe(0);
    expect(screen.queryAllByText('Timeline Impact').length).toBe(0);
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 1')).not.toBeInTheDocument();
    expect(screen.queryByText('$11')).not.toBeInTheDocument();
    expect(screen.queryByText('111 weeks')).not.toBeInTheDocument();
    expect(screen.queryByText('Desc 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 2')).not.toBeInTheDocument();
    expect(screen.queryByText('$22')).not.toBeInTheDocument();
    expect(screen.queryByText('222 weeks')).not.toBeInTheDocument();
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

  it('Renders correctly when not empty and CR is not reviewed', () => {
    renderComponent(exampleProposedSolutions, true);
    expect(screen.queryByText('+ Add Proposed Solution')).not.toBeInTheDocument();
    expect(screen.getAllByText('Description').length).toBe(2);
    expect(screen.getAllByText('Scope Impact').length).toBe(2);
    expect(screen.getAllByText('Budget Impact').length).toBe(2);
    expect(screen.getAllByText('Timeline Impact').length).toBe(2);
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 1')).toBeInTheDocument();
    expect(screen.getByText('$11')).toBeInTheDocument();
    expect(screen.getByText('111 weeks')).toBeInTheDocument();
    expect(screen.getByText('Desc 2')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 2')).toBeInTheDocument();
    expect(screen.getByText('$22')).toBeInTheDocument();
    expect(screen.getByText('222 weeks')).toBeInTheDocument();
  });

  it('Renders correctly when empty and CR is not reviewed', () => {
    renderComponent([], true);
    expect(screen.queryByText('+ Add Proposed Solution')).not.toBeInTheDocument();
    expect(screen.queryAllByText('Description').length).toBe(0);
    expect(screen.queryAllByText('Scope Impact').length).toBe(0);
    expect(screen.queryAllByText('Budget Impact').length).toBe(0);
    expect(screen.queryAllByText('Timeline Impact').length).toBe(0);
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 1')).not.toBeInTheDocument();
    expect(screen.queryByText('$11')).not.toBeInTheDocument();
    expect(screen.queryByText('111 weeks')).not.toBeInTheDocument();
    expect(screen.queryByText('Desc 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 2')).not.toBeInTheDocument();
    expect(screen.queryByText('$22')).not.toBeInTheDocument();
    expect(screen.queryByText('222 weeks')).not.toBeInTheDocument();
  });
});
