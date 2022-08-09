/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, screen } from '../../../../test-support/test-utils';
import { exampleUserSettingsLight } from '../../../../test-support/test-data/user-settings.stub';
import UserSettingsEdit from './user-settings-edit';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(
    <UserSettingsEdit currentSettings={exampleUserSettingsLight} onSubmit={jest.fn()} />
  );
};

describe('user settings edit component', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders default theme', () => {
    renderComponent();
    expect(screen.getByText(exampleUserSettingsLight.defaultTheme)).toBeInTheDocument();
  });

  it('renders select dropdown with label', () => {
    renderComponent();
    expect(screen.getByLabelText('Default Theme')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders select dropdown with options', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('DARK')).toBeInTheDocument();
    expect(screen.getByText('LIGHT')).toBeInTheDocument();
  });
});
