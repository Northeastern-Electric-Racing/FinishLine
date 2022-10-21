/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, waitFor, fireEvent, routerWrapperBuilder } from '../../test-support/test-utils';
import NavUserMenu from '../../../layouts/NavTopBar/NavUserMenu';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <NavUserMenu />
    </RouterWrapper>
  );
};

describe('navigation user menu tests', () => {
  it('renders the button and user menu items', async () => {
    renderComponent();
    const user: HTMLElement = screen.getByRole('button');
    expect(user).toBeInTheDocument();

    fireEvent.click(user);

    await waitFor(() => screen.getByText(/Settings/i));

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
