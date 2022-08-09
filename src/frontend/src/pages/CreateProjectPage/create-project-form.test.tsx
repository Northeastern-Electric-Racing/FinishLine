/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { render, screen } from '../../test-support/test-utils';
import { useAuth } from '../../services/auth.hooks';
import { Auth } from '../../types';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import CreateProjectForm from './create-project-form';

jest.mock('../../services/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user: User) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<CreateProjectForm />);
};

describe('create project form test suite', () => {
  it('render view component', () => {
    mockAuthHook(exampleAdminUser);
    renderComponent();

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('disables the submit button for guest users', () => {
    mockAuthHook(exampleGuestUser);
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables the submit button for admin users', () => {
    mockAuthHook(exampleAdminUser);
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
