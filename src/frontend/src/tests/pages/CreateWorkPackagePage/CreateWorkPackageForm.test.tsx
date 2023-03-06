/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import { useAuth } from '../../../hooks/auth.hooks';
import { Auth } from '../../../utils/types';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import CreateWorkPackageForm from '../../../pages/CreateWorkPackagePage/CreateWorkPackageForm';
import { useQuery } from '../../../hooks/utils.hooks';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../hooks/auth.hooks');
jest.mock('../../../hooks/utils.hooks');
jest.mock('../../../hooks/toasts.hooks');

jest.mock('../../../components/ReactHookTextField', () => {
  return {
    __esModule: true,
    default: () => <p>React hook text field component</p>
  };
});

const mockedUseAuth = useAuth as jest.Mock<Auth>;
const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

const mockUseQuery = () => {
  mockedUseQuery.mockReturnValue(new URLSearchParams(''));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(
    <BrowserRouter>
      <CreateWorkPackageForm />
    </BrowserRouter>
  );
};

describe('create wp form test suite', () => {
  it('disables submit button for guest users', () => {
    mockAuthHook(exampleGuestUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button for admin users', () => {
    mockAuthHook();
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
