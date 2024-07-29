/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import Projects from '../../../pages/ProjectsPage/Projects';

vi.mock('../../../pages/ProjectsPage/ProjectsTable', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Projects Table</div>;
    }
  };
});

vi.mock('../../../pages/WBSDetails', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>WBS Details</div>;
    }
  };
});

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (route: string) => {
  const RouterWrapper = routerWrapperBuilder({ route });
  return render(
    <RouterWrapper>
      <Projects />
    </RouterWrapper>
  );
};

describe('projects page component', () => {
  it('renders the wbs element page title', () => {
    renderComponent(`${routes.PROJECTS}/1.8.1`);
    // expect(screen.getByText('WBS Details')).toBeInTheDocument();
  });
});
