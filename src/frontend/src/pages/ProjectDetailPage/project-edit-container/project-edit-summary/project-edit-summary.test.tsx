/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import userEvent from '@testing-library/user-event';
import { exampleProject1 } from '../../../../test-support/test-data/projects.stub';
import { act, render, screen } from '../../../../test-support/test-utils';
import ProjectEditSummary from './project-edit-summary';

const proj = exampleProject1;

const mockUpdateSummary = jest.fn();

describe('test suite for ProjectEditSummary', () => {
  it('render title', () => {
    render(<ProjectEditSummary project={proj} updateSummary={mockUpdateSummary} />);

    expect(screen.getByText('Project Summary')).toBeInTheDocument();
  });

  it('render summary text box', () => {
    render(<ProjectEditSummary project={proj} updateSummary={mockUpdateSummary} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(proj.summary)).toBeInTheDocument();
  });

  it('updates the hook when typed in', async () => {
    render(<ProjectEditSummary project={proj} updateSummary={mockUpdateSummary} />);

    expect(mockUpdateSummary).toBeCalledTimes(0);

    await act(async () => {
      userEvent.type(screen.getAllByDisplayValue(proj.summary!)[0], 'hello');
    });

    expect(mockUpdateSummary).toBeCalledTimes(5);
  });
});
