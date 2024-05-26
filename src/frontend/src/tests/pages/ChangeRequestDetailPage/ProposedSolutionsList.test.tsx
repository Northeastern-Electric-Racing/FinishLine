/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import ProposedSolutionsList from '../../../pages/ChangeRequestDetailPage/ProposedSolutionsList';
import { ProposedSolution } from 'shared';
import { exampleAdminUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import { ToastProvider } from '../../../components/Toast/ToastProvider';
import AppContextUser from '../../../app/AppContextUser';
import * as userHooks from '../../../hooks/users.hooks';

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
    <AppContextUser>
      <RouterWrapper>
        <ToastProvider>
          <ProposedSolutionsList proposedSolutions={proposedSolutions} crReviewed={crReviewed} crId={"0"} />{' '}
        </ToastProvider>
      </RouterWrapper>
    </AppContextUser>
  );
};

describe('Proposed Solutions List Test Suite', () => {
  beforeEach(() => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
  });

  it('Renders correctly when empty and CR is not reviewed', () => {
    renderComponent();
    expect(screen.queryAllByText('Description').length).toBe(0);
    expect(screen.queryAllByText('Scope Impact').length).toBe(0);
    expect(screen.queryByText('Desc 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 1')).not.toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();
    expect(screen.queryByText('111 weeks')).not.toBeInTheDocument();
    expect(screen.queryByText('Desc 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact 2')).not.toBeInTheDocument();
    expect(screen.queryByText('22')).not.toBeInTheDocument();
    expect(screen.queryByText('222 weeks')).not.toBeInTheDocument();
  });

  it('Fires Modal correctly', () => {
    renderComponent();
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
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
