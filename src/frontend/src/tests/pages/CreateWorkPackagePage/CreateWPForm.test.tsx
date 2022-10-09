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
import { useQuery } from '../../../hooks/Utils.hooks';

jest.mock('../../../hooks/Auth.hooks');
jest.mock('../../../hooks/Utils.hooks');

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
  return render(<CreateWPForm />);
};

describe('create wp form test suite', () => {
  it('render view component', () => {
    mockAuthHook();
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create New Work Package')).toBeInTheDocument();
  });

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
