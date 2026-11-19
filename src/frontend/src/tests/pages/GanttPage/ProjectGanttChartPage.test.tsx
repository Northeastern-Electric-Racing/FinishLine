/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder, fireEvent } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleAuthenticatedAdminUser } from '../../test-support/test-data/authenticated-user.stub';
import * as projectHooks from '../../../hooks/projects.hooks';
import * as teamHooks from '../../../hooks/teams.hooks';
import * as teamTypeHooks from '../../../hooks/team-types.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import * as retrospectiveHooks from '../../../hooks/retrospective.hooks';
import { RETROSPECTIVE_MODE_STORAGE_KEY } from '../../../hooks/gantt.hooks';
import ProjectGanttChartPage from '../../../pages/GanttPage/ProjectGanttChart/ProjectGanttChartPage';
import { ProjectGanttItem, RetrospectiveProject, TeamPreview, TeamType } from 'shared';
import { ToastContext } from '../../../components/Toast/ToastProvider';

// a stable value, like the real context provides; a new object every render would loop the page's car filter effect
vi.mock('../../../app/AppGlobalCarFilterContext', () => {
  const carFilter = {
    selectedCar: 'all-cars',
    allCars: [],
    setSelectedCar: () => {},
    isLoading: false,
    error: null
  };
  return { useGlobalCarFilter: () => carFilter };
});

// fetches its own data and isn't part of what's under test
vi.mock('../../../pages/GanttPage/ProjectGanttChart/AddGanttTaskModal', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('../../../layouts/PageTitle/PageBreadcrumbs', () => ({
  __esModule: true,
  default: () => <div>page-breadcrumbs</div>
}));

// the chart itself is covered elsewhere; here we only care whether it's editable
vi.mock('../../../pages/GanttPage/GanttChart/GanttChart', () => ({
  __esModule: true,
  default: ({ editability }: { editability?: unknown }) => <div>{editability ? 'editable chart' : 'read-only chart'}</div>
}));

const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.GANTT, route: routes.GANTT });
  return render(
    <RouterWrapper>
      <ToastContext.Provider value={{ addToast: vi.fn() }}>
        <ProjectGanttChartPage />
      </ToastContext.Provider>
    </RouterWrapper>
  );
};

describe('ProjectGanttChartPage retrospective toggle', () => {
  let retroSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedAdminUser);
    vi.spyOn(projectHooks, 'useAllProjectsGantt').mockReturnValue(mockUseQueryResult<ProjectGanttItem[]>(false, false, []));
    vi.spyOn(teamHooks, 'useAllTeams').mockReturnValue(mockUseQueryResult<TeamPreview[]>(false, false, []));
    vi.spyOn(teamTypeHooks, 'useAllTeamTypes').mockReturnValue(mockUseQueryResult<TeamType[]>(false, false, []));
    retroSpy = vi
      .spyOn(retrospectiveHooks, 'useGetRetrospectiveTimelines')
      .mockReturnValue(mockUseQueryResult<RetrospectiveProject[]>(false, false, []));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in the standard view', () => {
    renderComponent();

    expect(screen.getByText('Gantt Chart')).toBeInTheDocument();
    expect(screen.queryByText('Retrospective')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Retrospective' })).not.toBeChecked();
    expect(screen.queryByLabelText('Start Date For Retro')).not.toBeInTheDocument();
    expect(screen.getByText('editable chart')).toBeInTheDocument();
    // the retrospective data isn't fetched until the toggle is on
    expect(retroSpy).toHaveBeenLastCalledWith(undefined, undefined, false);
  });

  it('switches to the read-only retrospective view when toggled on', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Retrospective' }));

    const title = screen.getByRole('heading', { name: 'Retrospective' });
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle({ color: '#ef4345' });
    expect(screen.queryByText('Gantt Chart')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Start Date For Retro')).toBeInTheDocument();
    expect(screen.getByText('read-only chart')).toBeInTheDocument();
    expect(retroSpy).toHaveBeenLastCalledWith(undefined, undefined, true);
  });

  it('keeps the setting for the session', () => {
    const { unmount } = renderComponent();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Retrospective' }));
    expect(sessionStorage.getItem(RETROSPECTIVE_MODE_STORAGE_KEY)).toBe('true');
    unmount();

    renderComponent();

    expect(screen.getByRole('checkbox', { name: 'Retrospective' })).toBeChecked();
    expect(screen.getByRole('heading', { name: 'Retrospective' })).toBeInTheDocument();
  });

  it('goes back to the standard view when toggled off', () => {
    sessionStorage.setItem(RETROSPECTIVE_MODE_STORAGE_KEY, 'true');
    renderComponent();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Retrospective' }));

    expect(screen.getByText('Gantt Chart')).toBeInTheDocument();
    expect(screen.getByText('editable chart')).toBeInTheDocument();
    expect(sessionStorage.getItem(RETROSPECTIVE_MODE_STORAGE_KEY)).toBe('false');
  });
});
