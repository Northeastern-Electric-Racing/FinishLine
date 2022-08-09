/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../test-support/test-utils';
import EditModeOptions from './edit-mode-options';

// TODO: Add better tests for this component.
describe('Renders edit mode options', () => {
  test('renders all of the buttons for edit mode', () => {
    render(<EditModeOptions exitEditMode={() => null} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
