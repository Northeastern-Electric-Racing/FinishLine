/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import themes from '../../../themes';
import { render, screen } from '../../../test-support/test-utils';
import LoginPage from './login-page';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(
    <LoginPage
      devSetRole={(s: string) => {}}
      devFormSubmit={(e) => e}
      prodSuccess={(r) => r}
      prodFailure={(r) => r}
      theme={themes[0]}
    />
  );
};

describe('login page component', () => {
  it('renders title', () => {
    renderComponent();
    expect(screen.getByText(/NER PM Dashboard/i)).toBeInTheDocument();
  });

  it('renders help text', () => {
    renderComponent();
    expect(screen.getByText(/Login Required/i)).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderComponent();
    const btn = screen.getByText('Login');
    expect(btn).toBeInTheDocument();
  });

  it('renders cookie text', () => {
    renderComponent();
    expect(screen.getByText('This site uses cookies.')).toBeInTheDocument();
  });
});
