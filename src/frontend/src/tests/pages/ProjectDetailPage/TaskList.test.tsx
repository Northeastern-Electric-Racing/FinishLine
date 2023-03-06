/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TeamPreview } from 'shared';
import * as authHooks from '../../../hooks/auth.hooks';
import * as taskHooks from '../../../hooks/tasks.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import TaskList from '../../../pages/ProjectDetailPage/ProjectViewContainer/TaskList';
import {
  mockCreateTaskReturnValue,
  mockDeleteTaskReturnValue,
  mockEditTaskAssigneesReturnValue,
  mockEditTaskReturnValue,
  mockUseAllUsersReturnValue
} from '../../test-support/mock-hooks';
import { exampleTeam } from '../../test-support/test-data/teams.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import { exampleWbs1 } from '../../test-support/test-data/wbs-numbers.stub';
import { routerWrapperBuilder } from '../../test-support/test-utils';

jest.mock('../../../hooks/toasts.hooks');

const users = [exampleAdminUser, exampleLeadershipUser];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (team?: TeamPreview, hasTaskPermissions: boolean = true) => {
  const RouterWrapper = routerWrapperBuilder({});
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterWrapper>
        <TaskList tasks={[]} team={team} hasTaskPermissions={hasTaskPermissions} currentWbsNumber={exampleWbs1} />
      </RouterWrapper>
    </QueryClientProvider>
  );
};

describe('TaskList component', () => {
  // declaring in this scope allows you to mockReturnValue to a different user in each test
  const spyUseAuthHook = jest.spyOn(authHooks, 'useAuth');

  beforeEach(() => {
    spyUseAuthHook.mockReturnValue(mockAuth(false, exampleAdminUser));
    jest.spyOn(userHooks, 'useAllUsers').mockReturnValue(mockUseAllUsersReturnValue(users));
    jest.spyOn(taskHooks, 'useCreateTask').mockReturnValue(mockCreateTaskReturnValue);
    jest.spyOn(taskHooks, 'useEditTask').mockReturnValue(mockEditTaskReturnValue);
    jest.spyOn(taskHooks, 'useEditTaskAssignees').mockReturnValue(mockEditTaskAssigneesReturnValue);
    jest.spyOn(taskHooks, 'useDeleteTask').mockReturnValue(mockDeleteTaskReturnValue);
  });

  it('renders "Task List" on top', () => {
    renderComponent(exampleTeam);
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('renders all 3 labels', () => {
    renderComponent(exampleTeam);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Backlog')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  describe('New Task Button', () => {
    it('renders New Task button', () => {
      renderComponent(exampleTeam);
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('enables New Task button if user has permission', () => {
      renderComponent(exampleTeam);
      expect(screen.getByText('New Task')).toBeEnabled();
    });

    it('disables New Task button if user does not have permission', () => {
      renderComponent(exampleTeam, false);
      expect(screen.getByText('New Task')).toBeDisabled();
    });

    it('disables New Task button if there is no associated team', () => {
      renderComponent();
      expect(screen.getByText('New Task')).toBeDisabled();
    });
  });

  describe('Tab Contents', () => {
    it('renders message if there is no associated team', () => {
      renderComponent();
      expect(screen.getByText('A project can only have tasks if it is assigned to a team!')).toBeInTheDocument();
    });

    it('does not render no-team message if there is an associated team', () => {
      renderComponent(exampleTeam);
      expect(screen.queryByText('A project can only have tasks if it is assigned to a team!')).toBeNull();
    });
  });
});
