/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import { ProposedSolution } from 'shared';
import { exampleAdminUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
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

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (proposedSolution = exampleProposedSolution) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionView onEdit={() => {}} proposedSolution={proposedSolution} />
    </RouterWrapper>
  );
};

describe('Proposed Solutions View Test Suite', () => {
  it('Renders correctly when approved', () => {
    renderComponent();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact:')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 1')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('111 weeks')).toBeInTheDocument();
  });

  it('Renders correctly when not approved', () => {
    renderComponent(exampleProposedSolution2);
    expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact:')).toBeInTheDocument();
    expect(screen.getByText('Desc 2')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact 2')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('222 weeks')).toBeInTheDocument();
  });
});
