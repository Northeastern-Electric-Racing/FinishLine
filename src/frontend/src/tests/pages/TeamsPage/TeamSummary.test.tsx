/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen, waitFor } from '../../test-support/test-utils';
import TeamSummary from '../../../pages/TeamsPage/TeamSummary';
import { exampleTeam } from '../../test-support/test-data/teams.stub';
import { TeamWithProjects } from 'shared';

const exampleTeamWithProjects: TeamWithProjects = {
  teamId: exampleTeam.teamId,
  teamName: exampleTeam.teamName,
  head: exampleTeam.head,
  memberCount: exampleTeam.members.length,
  leadCount: exampleTeam.leads.length,
  projects: exampleTeam.projects.map((project) => ({ name: project.name, wbsNum: project.wbsNum }))
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <TeamSummary team={exampleTeamWithProjects} />
    </RouterWrapper>
  );
};

describe('Rendering Team Summary Component', () => {
  it('Renders Team Name', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(exampleTeam.teamName)).toBeInTheDocument();
    });
  });
});
