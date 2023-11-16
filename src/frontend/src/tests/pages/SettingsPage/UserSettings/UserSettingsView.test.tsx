/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../test-support/test-utils';
import { exampleUserSettingsLight } from '../../../test-support/test-data/user-settings.stub';
import UserSettingsView from '../../../../pages/SettingsPage/UserSettings/UserSettingsView';
import { displayEnum } from '../../../../utils/pipes';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<UserSettingsView settings={exampleUserSettingsLight} />);
};

describe('user settings view component', () => {
  it('renders default theme', () => {
    renderComponent();
    expect(screen.getByText(displayEnum(exampleUserSettingsLight.defaultTheme))).toBeInTheDocument();
  });
});
