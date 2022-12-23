/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import CreateProjectFormView from '../../../pages/CreateProjectPage/CreateProjectFormView';
import { BrowserRouter } from 'react-router-dom';

const mockStates = {
  name: () => null,
  carNumber: () => null,
  crId: () => null,
  summary: () => null
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (allowSubmit = true) => {
  return render(
    <BrowserRouter>
      <CreateProjectFormView states={mockStates} onCancel={() => null} onSubmit={() => null} allowSubmit={allowSubmit} />
    </BrowserRouter>
  );
};

describe('create project form view test suite', () => {
  it('renders buttons', () => {
    renderComponent();

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables submit button when allowSubmit is false', () => {
    renderComponent(false);

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button when allowSubmit is true', () => {
    renderComponent(true);

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
