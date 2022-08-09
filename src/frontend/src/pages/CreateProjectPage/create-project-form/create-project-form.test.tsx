/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../test-support/test-utils';
import CreateProjectFormView from './create-project-form';

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
    <CreateProjectFormView
      states={mockStates}
      onCancel={() => null}
      onSubmit={() => null}
      allowSubmit={allowSubmit}
    />
  );
};

describe('create project form view test suite', () => {
  it('renders title', () => {
    renderComponent();

    expect(screen.queryByText('Create New Project')).toBeInTheDocument();
  });

  it('renders project name form input', () => {
    renderComponent();

    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter project name...')).toBeInTheDocument();
  });

  it('renders car number form input', () => {
    renderComponent();

    expect(screen.getByLabelText('Car Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter car number...')).toBeInTheDocument();
  });

  it('renders change request id form input', () => {
    renderComponent();

    expect(screen.getByLabelText('Change Request ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter change request ID...')).toBeInTheDocument();
  });

  it('renders project summary form input', () => {
    renderComponent();

    expect(screen.getByLabelText('Project Summary')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter summary...')).toBeInTheDocument();
  });

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
