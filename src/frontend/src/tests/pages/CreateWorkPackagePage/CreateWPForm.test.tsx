/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../TestSupport/TestUtils';
import { useAuth } from '../../../hooks/Auth.hooks';
import { Auth } from '../../../utils/Types';
import { exampleAdminUser, exampleGuestUser } from '../../TestSupport/TestData/Users.stub';
import { mockAuth } from '../../TestSupport/TestData/TestUtils.stub';
import CreateWPForm from '../../../pages/CreateWorkPackagePage/CreateWPForm';

jest.mock('../../../hooks/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<CreateWPForm />);
};

describe('create wp form test suite', () => {
  it('render view component', () => {
    mockAuthHook();
    renderComponent();

    expect(screen.getByText('Create New Work Package')).toBeInTheDocument();
  });

  it('disables submit button for guest users', () => {
    mockAuthHook(exampleGuestUser);
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button for admin users', () => {
    mockAuthHook();
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
