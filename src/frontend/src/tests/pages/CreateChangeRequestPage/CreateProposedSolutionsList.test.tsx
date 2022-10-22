/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import CreateProposedSolutionsList from '../../../pages/CreateChangeRequestPage/CreateProposedSolutionsList';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <CreateProposedSolutionsList proposedSolutions={[]} setProposedSolutions={() => {}} />
    </RouterWrapper>
  );
};

describe('Proposed Solutions List Test Suite', () => {
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
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
