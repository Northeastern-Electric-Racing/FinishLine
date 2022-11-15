/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import ProposedSolutionForm from '../../../pages/ChangeRequestDetailPage/ProposedSolutionForm';

/**
 * Mock function for submitting the form, use if there is additional functionality added while submitting
 */
const mockHandleSubmit = jest.fn();

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (readOnly: boolean, description = '', budgetImpact = 0, timelineImpact = 0, scopeImpact = '') => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProposedSolutionForm
        readOnly={readOnly}
        onAdd={mockHandleSubmit}
        description={description}
        budgetImpact={budgetImpact}
        timelineImpact={timelineImpact}
        scopeImpact={scopeImpact}
      />
    </RouterWrapper>
  );
};

describe('Individual Proposed Solution Form Test Suite', () => {
  it('Renders labels for inputs correctly when readOnly', () => {
    renderComponent(true);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope Impact')).toBeInTheDocument();
  });

  it('Renders labels for inputs correctly when not readOnly', () => {
    renderComponent(false);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeline Impact')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope Impact')).toBeInTheDocument();
  });

  it('Does not render add button when readOnly', () => {
    renderComponent(true);
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('Renders add button when not readOnly', () => {
    renderComponent(false);
    expect(screen.getByText('Add')).toBeInTheDocument();
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
