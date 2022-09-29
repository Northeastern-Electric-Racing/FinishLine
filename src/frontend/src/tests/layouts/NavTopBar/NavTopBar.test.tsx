/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import NavTopBar from '../../../layouts/NavTopBar/NavTopBar';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <NavTopBar />
    </RouterWrapper>
  );
};

describe('navigation top bar tests', () => {
  it('renders site title', () => {
    renderComponent();
    expect(screen.getByText(/FinishLine by NER/i)).toBeInTheDocument();
  });
});
