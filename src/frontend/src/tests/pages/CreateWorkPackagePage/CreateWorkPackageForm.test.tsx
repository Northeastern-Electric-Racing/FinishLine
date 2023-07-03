/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

 import { render, screen } from '../../test-support/test-utils';
 import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
 import CreateWorkPackageForm from '../../../pages/CreateWorkPackagePage/CreateWorkPackageForm';
 import { useQuery } from '../../../hooks/utils.hooks';
 import { BrowserRouter } from 'react-router-dom';
 import { useCurrentUser } from '../../../hooks/users.hooks';
 import { User } from 'shared';

jest.mock('../../../hooks/utils.hooks');
jest.mock('../../../hooks/toasts.hooks');
jest.mock('../../../hooks/users.hooks');

jest.mock('../../../components/ReactHookTextField', () => {
  return {
    __esModule: true,
    default: () => <p>React hook text field component</p>
  };
});

 const mockedUseCurrentUser = useCurrentUser as jest.Mock<User>;
 const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;

 const mockCurrentUser = (user = exampleAdminUser) => {
   mockedUseCurrentUser.mockReturnValue(user);
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

describe.skip('create wp form test suite', () => {
  it('disables submit button for guest users', () => {
    mockCurrentUser(exampleGuestUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button for admin users', () => {
    mockCurrentUser();
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
