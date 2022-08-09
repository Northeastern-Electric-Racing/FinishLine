/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  render,
  screen,
  routerWrapperBuilder,
  fireEvent,
  act
} from '../../../test-support/test-utils';
import { Auth } from '../../../types';
import { useAuth } from '../../../services/auth.hooks';
import { exampleProject1 } from '../../../test-support/test-data/projects.stub';
import { mockAuth } from '../../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleGuestUser } from '../../../test-support/test-data/users.stub';
import ProjectViewContainer from './project-view-container';

jest.mock('../../../services/auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProjectViewContainer proj={exampleProject1} enterEditMode={jest.fn} />
    </RouterWrapper>
  );
};

describe('Rendering Project View Container', () => {
  it('renders the provided project', () => {
    mockAuthHook();
    renderComponent();

    expect(screen.getAllByText('1.1.0 - Impact Attenuator').length).toEqual(2);
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Work Packages')).toBeInTheDocument();
    expect(screen.getByText('Bodywork Concept of Design')).toBeInTheDocument();
  });

  it('disables the buttons for guest users', () => {
    mockAuthHook(exampleGuestUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).toHaveClass('disabled');
    expect(screen.getByText('Request Change')).toHaveClass('disabled');
  });

  it('enables the buttons for admin users', () => {
    mockAuthHook(exampleAdminUser);
    renderComponent();

    act(() => {
      fireEvent.click(screen.getByText('Actions'));
    });
    expect(screen.getByText('Edit')).not.toHaveClass('disabled');
    expect(screen.getByText('Request Change')).not.toHaveClass('disabled');
  });
});
