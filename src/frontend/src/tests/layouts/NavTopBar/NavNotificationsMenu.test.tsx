/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, waitFor, fireEvent, routerWrapperBuilder } from '../../test-support/test-utils';
import NavNotificationsMenu from '../../../layouts/NavTopBar/NavNotificationsMenu';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <NavNotificationsMenu />
    </RouterWrapper>
  );
};

describe('navigation notifications menu tests', () => {
  it('renders the bell button and notification menu items', async () => {
    renderComponent();
    const bell: HTMLElement = screen.getByRole('button');
    expect(bell).toBeInTheDocument();

    fireEvent.click(bell);

    await waitFor(() => screen.getByText(/0 Notifications/i));

    expect(screen.getByText('0 Notifications')).toBeInTheDocument();
    expect(screen.getByText('*Coming Soon*')).toBeInTheDocument();
  });
});
