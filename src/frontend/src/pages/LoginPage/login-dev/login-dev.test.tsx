/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, fireEvent } from '../../../test-support/test-utils';
import LoginDev from './login-dev';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<LoginDev devSetRole={(s: string) => {}} devFormSubmit={(e) => e} />);
};

describe('login dev-only component', () => {
  it('renders instruction text', () => {
    renderComponent();
    expect(screen.getByText('Select User')).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderComponent();
    const btn = screen.getByText('Log In');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('class', 'btn btn-primary');
  });

  it('has clickable role select', async () => {
    renderComponent();
    const btn = screen.getByRole('combobox');
    fireEvent.click(btn);
  });

  it('has expected role select options', async () => {
    renderComponent();
    const options = screen.getAllByRole('option');
    expect(options.length).toEqual(5);
  });
});
