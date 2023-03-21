import { UseMutationResult } from 'react-query';
import { AuthenticatedUser, DescriptionBullet, User, WorkPackage } from 'shared';
import { CreateTaskPayload, DeleteTaskPayload, TaskPayload } from '../../hooks/tasks.hooks';
import { VersionObject } from '../../utils/types';
import { mockUseMutationResult, mockUseQueryResult } from './test-data/test-utils.stub';
import { exampleAdminUser } from './test-data/users.stub';

export const mockLogUserInReturnValue = mockUseMutationResult<AuthenticatedUser>(
  false,
  false,
  exampleAdminUser as AuthenticatedUser,
  new Error()
) as UseMutationResult<AuthenticatedUser, Error, string, unknown>;

export const mockLogUserInDevReturnValue = mockUseMutationResult<AuthenticatedUser>(
  false,
  false,
  exampleAdminUser as AuthenticatedUser,
  new Error()
) as UseMutationResult<AuthenticatedUser, Error, number, unknown>;

export const mockUseAllUsersReturnValue = (users: User[]) => mockUseQueryResult<User[]>(false, false, users, new Error());

export const mockEditProjectReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
);

export const mockCreateTaskReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, CreateTaskPayload, unknown>;

export const mockEditTaskReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, TaskPayload, unknown>;

export const mockEditTaskAssigneesReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, { taskId: string; assignees: number[] }, unknown>;

export const mockDeleteTaskReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, DeleteTaskPayload, unknown>;

export const mockCheckDescBulletReturnValue = mockUseMutationResult<DescriptionBullet>(
  false,
  false,
  { id: 1, detail: 'detail', dateAdded: new Date() },
  undefined
);

export const mockGetVersionNumberReturnValue = (versionObject: VersionObject) =>
  mockUseQueryResult<VersionObject>(false, false, versionObject);

export const mockUseAllWorkPackagesReturnValue = (workPackages: WorkPackage[]) =>
  mockUseQueryResult<WorkPackage[]>(false, false, workPackages, new Error());
