/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import ProposedSolutionForm from '../../../pages/ChangeRequestDetailPage/ProposedSolutionForm';
import { batman } from '../../../../../backend/tests/test-data/users.test-data';

/**
 * Mock function for submitting the form, use if there is additional functionality added while submitting
 */
const mockHandleSubmit = vi.fn();

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (readOnly: boolean, description = '', budgetImpact = 0, timelineImpact = 0, scopeImpact = '') => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionForm
        readOnly={readOnly}
        onSubmit={mockHandleSubmit}
        defaultValues={{
          description,
          budgetImpact,
          timelineImpact,
          scopeImpact,
          id: '',
          createdBy: batman,
          dateCreated: new Date(),
          approved: false
        }}
        open={true}
        onClose={() => {}}
      />
    </RouterWrapper>
  );
};

describe('Individual Proposed Solution Form Test Suite', () => {
  it('Renders everything correctly when readOnly', () => {
    renderComponent(true);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact')).toBeInTheDocument();
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('Renders everything correctly when not readOnly', () => {
    renderComponent(false);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByText('Scope Impact')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('Renders prefill elements when readOnly', () => {
    renderComponent(true, 'Test Description', 1, 2, 'Test Scope');
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue(1)).toBeInTheDocument();
    expect(screen.getByDisplayValue(2)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Scope')).toBeInTheDocument();
  });

  it('Renders prefill elements when not readOnly', () => {
    renderComponent(false, 'Test Description', 1, 2, 'Test Scope');
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue(1)).toBeInTheDocument();
    expect(screen.getByDisplayValue(2)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Scope')).toBeInTheDocument();
  });
});
