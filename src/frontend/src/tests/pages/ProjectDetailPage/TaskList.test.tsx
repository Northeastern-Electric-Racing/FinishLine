/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { routerWrapperBuilder } from '../../test-support/test-utils';
import * as authHooks from '../../../hooks/auth.hooks';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleGuestUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import TaskList from '../../../pages/ProjectDetailPage/ProjectViewContainer/TaskList';
import { useAuth } from '../../../hooks/auth.hooks';
import { Auth } from '../../../utils/types';
import { useAllUsers } from '../../../hooks/users.hooks';
import { UseQueryResult } from 'react-query';
import { User } from 'shared';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { useCreateTask, useDeleteTask, useEditTask, useEditTaskAssignees } from '../../../hooks/tasks.hooks';
import { UseMutationResult } from 'react-query';
import { mockUseMutationResult } from '../../test-support/test-data/test-utils.stub';
import { QueryClient, QueryClientProvider } from 'react-query';
import { exampleWbs1 } from '../../test-support/test-data/wbs-numbers.stub';
import { exampleTeam } from '../../test-support/test-data/teams.stub';

jest.mock('../../../hooks/auth.hooks');
jest.mock('../../../hooks/toasts.hooks');

jest.mock('../../../hooks/auth.hooks');
const mockedUseAuth = useAuth as jest.Mock<Auth>;
const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

jest.mock('../../../hooks/tasks.hooks');
const mockedCreateTask = useCreateTask as jest.Mock<UseMutationResult>;
const mockCreateTaskHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedCreateTask.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};
const mockedEditTask = useEditTask as jest.Mock<UseMutationResult>;
const mockEditTaskHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedEditTask.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};
const mockedEditTaskAssignees = useEditTaskAssignees as jest.Mock<UseMutationResult>;
const mockEditTaskHookAssignees = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedEditTaskAssignees.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};
const mockedDeleteTask = useDeleteTask as jest.Mock<UseMutationResult>;
const mockDeleteTaskHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedDeleteTask.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};

jest.mock('../../../hooks/users.hooks');
const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;
const mockUserHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
};
const users = [exampleAdminUser, exampleLeadershipUser];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (team = exampleTeam) => {
  const RouterWrapper = routerWrapperBuilder({});
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterWrapper>
        <TaskList tasks={[]} team={team} hasTaskPermissions={true} currentWbsNumber={exampleWbs1} />
      </RouterWrapper>
    </QueryClientProvider>
  );
};

describe('TaskList component', () => {
  const spyUseAuthHook = jest.spyOn(authHooks, 'useAuth');

  beforeEach(() => {
    spyUseAuthHook.mockReturnValue(mockAuth(false, exampleAdminUser));
    mockAuthHook();
    mockUserHook(false, false, users);
    mockCreateTaskHook(false, false);
    mockEditTaskHook(false, false);
    mockDeleteTaskHook(false, false);
    mockEditTaskHookAssignees(false, false);
  });

  it('renders "Task List" on top', () => {
    renderComponent();
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('renders all 3 labels', () => {
    renderComponent();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Backlog')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  describe('New Task button', () => {
    it('renders New Task button', () => {
      renderComponent();
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('enables New Task button for leadership', () => {
      spyUseAuthHook.mockReturnValue(mockAuth(false, exampleLeadershipUser));
      renderComponent();
      expect(screen.getByText('New Task')).toBeEnabled();
    });

    it('disables New Task button for guests', () => {
      spyUseAuthHook.mockReturnValue(mockAuth(false, exampleGuestUser));
      renderComponent();
      expect(screen.getByText('New Task')).toBeDisabled();
    });
  });
});
