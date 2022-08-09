/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../routes';
import ActionButton from './action-button';

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ActionButton link={routes.CHANGE_REQUESTS} icon={faPlus} text={'test'} />
    </RouterWrapper>
  );
};

describe('action button', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders text', () => {
    renderComponent();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('button clicks', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('test'));
  });
});
