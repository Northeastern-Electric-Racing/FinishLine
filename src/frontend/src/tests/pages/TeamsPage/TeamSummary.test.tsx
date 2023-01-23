/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import TeamSummary from '../../../pages/TeamsPage/TeamSummary';
import { exampleTeam } from '../../test-support/test-data/teams.stub';

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
  it('Renders Team Name', () => {
    renderComponent();
    expect(screen.getByText(exampleTeam.teamName)).toBeInTheDocument();
  });
});
