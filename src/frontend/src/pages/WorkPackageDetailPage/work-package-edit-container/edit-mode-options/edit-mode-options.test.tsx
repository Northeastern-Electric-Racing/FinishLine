/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../test-support/test-utils';
import EditModeOptions from './edit-mode-options';

// TODO: better tests here
describe('Renders edit mode options', () => {
  test('renders all of the buttons', () => {
    render(<EditModeOptions exitEditMode={() => {}} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
