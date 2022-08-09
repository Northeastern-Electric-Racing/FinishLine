/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../test-support/test-utils';
import { exampleUserSettingsLight } from '../../../../test-support/test-data/user-settings.stub';
import UserSettingsView from './user-settings-view';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<UserSettingsView settings={exampleUserSettingsLight} />);
};

describe('user settings view component', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders default theme', () => {
    renderComponent();
    expect(screen.getByText(exampleUserSettingsLight.defaultTheme)).toBeInTheDocument();
  });
});
