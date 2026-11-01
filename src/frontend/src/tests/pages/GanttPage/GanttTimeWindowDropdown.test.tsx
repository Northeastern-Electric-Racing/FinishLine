/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, within } from '../../test-support/test-utils';
import GanttTimeWindowDropdown from '../../../pages/GanttPage/ProjectGanttChart/GanttTimeWindowDropdown';
import { GanttTimeWindow } from '../../../utils/gantt.utils';

describe('Gantt time window dropdown', () => {
  it('shows the selected window', () => {
    render(<GanttTimeWindowDropdown timeWindow={GanttTimeWindow.HalfYear} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Half Year');
  });

  it('lists all four windows', () => {
    render(<GanttTimeWindowDropdown timeWindow={GanttTimeWindow.Month} onChange={vi.fn()} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));

    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Week', 'Month', 'Half Year', 'Year']);
  });

  it('reports the window that was selected', () => {
    const onChange = vi.fn();
    render(<GanttTimeWindowDropdown timeWindow={GanttTimeWindow.Month} onChange={onChange} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Year' }));

    expect(onChange).toHaveBeenCalledWith(GanttTimeWindow.Year);
  });
});
