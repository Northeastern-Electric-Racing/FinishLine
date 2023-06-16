/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import Sidebar from '../../../layouts/Sidebar/Sidebar';
import { mockGetVersionNumberReturnValue } from '../../test-support/mock-hooks';
import * as miscHooks from '../../../hooks/misc.hooks';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <Sidebar />
    </RouterWrapper>
  );
};

describe('Sidebar Tests', () => {
  it('Renders Navigation Links', () => {
    vi.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
    renderComponent();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Requests/i)).toBeInTheDocument();
  });
});
