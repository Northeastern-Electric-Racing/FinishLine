/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../TestSupport/TestUtils';
import { testLinkItems } from '../../TestSupport/TestData/TestUtils.stub';
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
  it('Renders Home Page Link', () => {
    renderComponent();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  it('Renders Projects Page Link', () => {
    renderComponent();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
  });

  it('Renders Change Requests Page Link', () => {
    renderComponent();
    expect(screen.getByText(/Change Requests/i)).toBeInTheDocument();
  });
});
