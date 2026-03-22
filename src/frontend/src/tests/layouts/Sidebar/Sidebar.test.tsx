/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import { mockGetVersionNumberReturnValue } from '../../test-support/mock-hooks';
import * as miscHooks from '../../../hooks/misc.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import Sidebar from '../../../layouts/Sidebar/Sidebar';
import { ToastContext, ToastInputs } from '../../../components/Toast/ToastProvider';
import { exampleAuthenticatedAdminUser } from '../../test-support/test-data/authenticated-user.stub';

vi.mock('../../../app/AppGlobalCarFilterContext', () => ({
  useGlobalCarFilter: () => ({
    selectedCar: null,
    allCars: [],
    setSelectedCar: vi.fn(),
    isLoading: false,
    error: null
  })
}));

const addToast = (message: ToastInputs) => {
  console.log(message);
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});

  return render(
    <RouterWrapper>
      <ToastContext.Provider value={{ addToast }}>
        <Sidebar drawerOpen={true} setDrawerOpen={() => {}} moveContent={true} setMoveContent={() => {}} />
      </ToastContext.Provider>
    </RouterWrapper>
  );
};

describe('Sidebar Tests', () => {
  it('Renders Navigation Links', () => {
    vi.spyOn(miscHooks, 'useGetVersionNumber').mockReturnValue(mockGetVersionNumberReturnValue({ tag_name: 'v3.5.4' }));
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedAdminUser);

    renderComponent();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Requests/i)).toBeInTheDocument();
  });
});
