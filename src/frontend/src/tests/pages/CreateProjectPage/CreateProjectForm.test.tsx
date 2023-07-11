/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team, User } from 'shared';
import { render, screen } from '../../test-support/test-utils';
import { useAuth } from '../../../hooks/auth.hooks';
import { Auth } from '../../../utils/types';
import { exampleAdminUser, exampleGuestUser } from '../../test-support/test-data/users.stub';
import { mockAuth, mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import CreateProjectForm from '../../../pages/CreateProjectPage/CreateProjectForm';
import { useQuery } from '../../../hooks/utils.hooks';
import { BrowserRouter } from 'react-router-dom';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { UseQueryResult } from 'react-query';
import { sharedTeam1 } from '../../../../../backend/tests/test-data/teams.test-data';

vi.mock('../../../hooks/auth.hooks');
vi.mock('../../../hooks/utils.hooks');
vi.mock('../../../hooks/teams.hooks');

vi.mock('../../../components/ReactHookTextField', () => {
  return {
    __esModule: true,
    default: () => <p>React hook text field component</p>
  };
});

const mockedUseAuth = useAuth as jest.Mock<Auth>;
const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;
const mockedSingleUseAllTeams = useAllTeams as jest.Mock<UseQueryResult<Team[]>>;
const mockUseAllTeams = (isLoading: boolean, isError: boolean, data?: Team[], error?: Error) => {
  mockedSingleUseAllTeams.mockReturnValue(mockUseQueryResult<Team[]>(isLoading, isError, data, error));
};

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
    const teamArray: Team[] = [sharedTeam1, sharedTeam1, sharedTeam1];
    mockUseAllTeams(false, false, teamArray);
    mockAuthHook(exampleGuestUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables the submit button for admin users', () => {
    const teamArray: Team[] = [sharedTeam1, sharedTeam1, sharedTeam1];
    mockUseAllTeams(false, false, teamArray);
    mockAuthHook(exampleAdminUser);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
