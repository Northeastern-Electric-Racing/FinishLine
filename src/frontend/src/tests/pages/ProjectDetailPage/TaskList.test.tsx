/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Project } from 'shared';
import * as authHooks from '../../../hooks/auth.hooks';
import * as taskHooks from '../../../hooks/tasks.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import TaskList from '../../../pages/ProjectDetailPage/ProjectViewContainer/TaskList/v1/TaskList';
import {
  mockCreateTaskReturnValue,
  mockDeleteTaskReturnValue,
  mockEditTaskAssigneesReturnValue,
  mockEditTaskReturnValue,
  mockUseAllUsersReturnValue
} from '../../test-support/mock-hooks';
import { exampleProject3 } from '../../test-support/test-data/projects.stub';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleGuestUser2, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import { routerWrapperBuilder } from '../../test-support/test-utils';

vi.mock('../../../hooks/toasts.hooks');

const users = [exampleAdminUser, exampleLeadershipUser];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (proj: Project = exampleProject3) => {
  const RouterWrapper = routerWrapperBuilder({});
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterWrapper>
        <TaskList project={proj} />
      </RouterWrapper>
    </QueryClientProvider>
  );
};

describe('TaskList component', () => {
  // declaring in this scope allows you to mockReturnValue to a different user in each test
  const spyUseAuthHook = vi.spyOn(authHooks, 'useAuth');

  beforeEach(() => {
    spyUseAuthHook.mockReturnValue(mockAuth(false, exampleAdminUser));
    vi.spyOn(userHooks, 'useAllUsers').mockReturnValue(mockUseAllUsersReturnValue(users));
    vi.spyOn(taskHooks, 'useCreateTask').mockReturnValue(mockCreateTaskReturnValue);
    vi.spyOn(taskHooks, 'useEditTask').mockReturnValue(mockEditTaskReturnValue);
    vi.spyOn(taskHooks, 'useEditTaskAssignees').mockReturnValue(mockEditTaskAssigneesReturnValue);
    vi.spyOn(taskHooks, 'useDeleteTask').mockReturnValue(mockDeleteTaskReturnValue);
  });

  it('renders all 3 labels', () => {
    renderComponent();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Backlog')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  describe('New Task Button', () => {
    it('renders New Task button', () => {
      renderComponent();
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('enables New Task button if user has permission', () => {
      renderComponent();
      expect(screen.getByText('New Task')).toBeEnabled();
    });

    it('disables New Task button if user does not have permission', () => {
      spyUseAuthHook.mockReturnValue(mockAuth(false, exampleGuestUser2));
      renderComponent();
      expect(screen.getByText('New Task')).toBeDisabled();
    });

    it('disables New Task button if there is no associated team', () => {
      renderComponent({ ...exampleProject3, teams: [] });
      expect(screen.getByText('New Task')).toBeDisabled();
    });
  });

  describe('Tab Contents', () => {
    it('renders message if there is no associated team', () => {
      renderComponent({ ...exampleProject3, teams: [] });
      expect(screen.getByText('A project can only have tasks if it is assigned to a team!')).toBeInTheDocument();
    });

    it('does not render no-team message if there is an associated team', () => {
      renderComponent();
      expect(screen.queryByText('A project can only have tasks if it is assigned to a team!')).toBeNull();
    });
  });
});
