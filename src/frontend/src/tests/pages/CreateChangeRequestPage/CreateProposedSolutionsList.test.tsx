/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import CreateProposedSolutionsList from '../../../pages/CreateChangeRequestPage/CreateProposedSolutionsList';
import * as authHooks from '../../../hooks/auth.hooks';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';
import * as userHooks from '../../../hooks/users.hooks';
import AppContextUser from '../../../app/AppContextUser';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <AppContextUser>
      <RouterWrapper>
        <CreateProposedSolutionsList proposedSolutions={[]} setProposedSolutions={() => {}} />
      </RouterWrapper>
    </AppContextUser>
  );
};

describe('Proposed Solutions List Test Suite', () => {
  beforeEach(() => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    vi.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  it('Renders correctly when empty', () => {
    renderComponent();
    expect(screen.getByText('+ Add Proposed Solution')).toBeInTheDocument();
    expect(screen.queryAllByText('Description').length).toBe(0);
    expect(screen.queryAllByText('Scope Impact').length).toBe(0);
    expect(screen.queryAllByText('Budget Impact').length).toBe(0);
    expect(screen.queryAllByText('Timeline Impact').length).toBe(0);
  });

  it('Fires Modal correctly', () => {
    renderComponent();
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Scope Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Timeline Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    screen.getByText('+ Add Proposed Solution').click();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
