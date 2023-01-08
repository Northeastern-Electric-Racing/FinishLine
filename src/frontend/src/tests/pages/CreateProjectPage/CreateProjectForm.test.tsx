/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { render, screen } from '../../test-support/test-utils';
import { useAuth } from '../../../hooks/auth.hooks';
import { Auth } from '../../../utils/types';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import CreateProjectForm from '../../../pages/CreateProjectPage/CreateProjectForm';
import { useQuery } from '../../../hooks/utils.hooks';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../hooks/auth.hooks');
jest.mock('../../../hooks/utils.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;
const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;

const mockAuthHook = (user: User) => {
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
      <CreateProjectForm />
    </BrowserRouter>
  );
};

describe('create project form test suite', () => {
  it('disables the submit button for guest users', () => {
    mockAuthHook(exampleGuestUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables the submit button for admin users', () => {
    mockAuthHook(exampleAdminUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
