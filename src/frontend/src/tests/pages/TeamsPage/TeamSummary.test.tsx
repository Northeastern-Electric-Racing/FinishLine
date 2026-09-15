/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen, waitFor } from '../../test-support/test-utils';
import TeamSummary from '../../../pages/TeamsPage/TeamSummary';
import { exampleTeam } from '../../test-support/test-data/teams.stub';
import { useSingleTeam } from '../../../hooks/teams.hooks';
import { UseQueryResult } from 'react-query';
import { Team } from 'shared';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';

vi.mock('../../../hooks/teams.hooks');

const mockedUseSingleTeam = useSingleTeam as jest.Mock<UseQueryResult<Team>>;
const mockSingleTeamHook = (isLoading: boolean, isError: boolean, data?: Team, error?: Error) => {
  mockedUseSingleTeam.mockReturnValue(mockUseQueryResult<Team>(isLoading, isError, data, error));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <TeamSummary team={exampleTeam} />
    </RouterWrapper>
  );
};

describe('Rendering Team Summary Component', () => {
  it('Renders Team Name', async () => {
    mockSingleTeamHook(false, false, exampleTeam);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(exampleTeam.teamName)).toBeInTheDocument();
    });
  });
});
