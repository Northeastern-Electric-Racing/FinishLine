/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import CreateProjectFormView from '../../../pages/CreateProjectPage/CreateProjectFormView';
import { useQuery } from '../../../hooks/utils.hooks';
import { BrowserRouter } from 'react-router-dom';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { Team } from 'shared';
import { UseQueryResult } from 'react-query';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { sharedTeam1 } from '../../../../../backend/tests/test-data/teams.test-data';

jest.mock('../../../hooks/utils.hooks');
jest.mock('../../../hooks/teams.hooks');

jest.mock('../../../components/ReactHookTextField', () => {
  return {
    __esModule: true,
    default: () => <p>React hook text field component</p>
  };
});

const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;
const mockedSingleUseAllTeams = useAllTeams as jest.Mock<UseQueryResult<Team[]>>;
const mockUseAllTeams = (isLoading: boolean, isError: boolean, data?: Team[], error?: Error) => {
  mockedSingleUseAllTeams.mockReturnValue(mockUseQueryResult<Team[]>(isLoading, isError, data, error));
};

const mockUseQuery = () => {
  mockedUseQuery.mockReturnValue(new URLSearchParams(''));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (allowSubmit = true) => {
  return render(
    <BrowserRouter>
      <CreateProjectFormView onCancel={() => null} onSubmit={() => null} allowSubmit={allowSubmit} />
    </BrowserRouter>
  );
};

describe('create project form view test suite', () => {
  it('renders buttons', () => {
    const teamArray: Team[] = [sharedTeam1, sharedTeam1, sharedTeam1];
    mockUseAllTeams(false, false, teamArray);
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables submit button when allowSubmit is false', () => {
    const teamArray: Team[] = [sharedTeam1, sharedTeam1, sharedTeam1];
    mockUseAllTeams(false, false, teamArray);
    mockUseQuery();
    renderComponent(false);

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button when allowSubmit is true', () => {
    const teamArray: Team[] = [sharedTeam1, sharedTeam1, sharedTeam1];
    mockUseAllTeams(false, false, teamArray);
    mockUseQuery();
    renderComponent(true);

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
