/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import ProposedSolutionsList from '../../../pages/ChangeRequestDetailPage/ProposedSolutionsList';
import { ProposedSolution } from 'shared';
import { exampleAdminUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import * as authHooks from '../../../hooks/auth.hooks';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { ToastProvider } from '../../../components/Toast/ToastProvider';

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
const renderComponent = (proposedSolutions: ProposedSolution[] = [], crReviewed: boolean | undefined = undefined) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ToastProvider>
        <ProposedSolutionsList proposedSolutions={proposedSolutions} crReviewed={crReviewed} crId={0} />{' '}
      </ToastProvider>
    </RouterWrapper>
  );
};

describe('Proposed Solutions List Test Suite', () => {
  beforeEach(() => {
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  it('Renders correctly when not empty and CR is not reviewed', () => {
    renderComponent(exampleProposedSolutions);
    expect(screen.getByText('+ Add Solution')).toBeInTheDocument();
    expect(screen.getAllByText(/Description/).length).toBe(2);
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
    renderComponent();
    expect(screen.getByText('+ Add Solution')).toBeInTheDocument();
    expect(screen.queryAllByText('Description').length).toBe(0);
    expect(screen.queryAllByText('Scope Impact').length).toBe(0);
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
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    screen.getByText('+ Add Solution').click();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('Renders correctly when not empty and CR is reviewed', () => {
    renderComponent(exampleProposedSolutions, true);
    expect(screen.queryByText('+ Add Solution')).not.toBeInTheDocument();
  });

  it('Renders correctly when empty and CR is reviewed', () => {
    renderComponent([], false);
    expect(screen.queryByText('+ Add Solution')).not.toBeInTheDocument();
  });
});
