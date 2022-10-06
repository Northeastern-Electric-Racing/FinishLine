/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import { testLinkItems } from '../../test-support/test-data/test-utils.stub';
import NavPageLinks from '../../../layouts/Sidebar/NavPageLinks';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <NavPageLinks linkItems={testLinkItems} />
    </RouterWrapper>
  );
};

describe('Navigation Page Links Tests', () => {
  it('renders all the test link items', () => {
    renderComponent();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Requests/i)).toBeInTheDocument();
  });
});
