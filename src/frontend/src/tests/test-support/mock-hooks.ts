import { UseMutationResult } from 'react-query';
import {
  AuthenticatedUser,
  DescriptionBullet,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  UserSettings,
  WorkPackage
} from 'shared';
import { CheckDescriptionBulletRequestPayload } from '../../hooks/description-bullets.hooks';
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
) as UseMutationResult<AuthenticatedUser, Error, string, unknown>;

export const mockUseAllUsersReturnValue = (users: User[]) => mockUseQueryResult<User[]>(false, false, users, new Error());

export const mockUseSingleUserSettings = (settings?: UserSettings) =>
  mockUseQueryResult<UserSettings>(
    false,
    false,
    settings || { id: 'id', defaultTheme: 'DARK', slackId: 'slackId' },
    new Error()
  );

export const mockUseUsersFavoriteProjects = (projects?: Project[]) =>
  mockUseQueryResult<Project[]>(false, false, projects || [], new Error());

export const mockEditProjectReturnValue = mockUseMutationResult<Task>(
  false,
  false,
  {
    taskId: '1',
    title: 'title',
    deadline: new Date(),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.Medium,
    wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
    notes: '',
    dateCreated: new Date(),
    createdBy: exampleAdminUser,
    assignees: []
  },
  new Error()
);

export const mockCreateTaskReturnValue = mockUseMutationResult<Task>(
  false,
  false,
  {
    taskId: '1',
    title: 'title',
    deadline: new Date(),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.Medium,
    wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
    notes: '',
    dateCreated: new Date(),
    createdBy: exampleAdminUser,
    assignees: []
  },
  new Error()
) as UseMutationResult<Task, Error, CreateTaskPayload, unknown>;

export const mockEditTaskReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, TaskPayload, unknown>;

export const mockEditTaskAssigneesReturnValue = mockUseMutationResult<Task>(
  false,
  false,
  {
    taskId: '1',
    title: 'title',
    deadline: new Date(),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.Medium,
    wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
    notes: '',
    dateCreated: new Date(),
    createdBy: exampleAdminUser,
    assignees: []
  },
  new Error()
) as UseMutationResult<Task, Error, { taskId: string; assignees: string[] }, unknown>;

export const mockDeleteTaskReturnValue = mockUseMutationResult<{ message: string }>(
  false,
  false,
  { message: 'hi' },
  new Error()
) as UseMutationResult<{ message: string }, Error, DeleteTaskPayload, unknown>;

export const mockCheckDescBulletReturnValue = mockUseMutationResult<DescriptionBullet>(
  false,
  false,
  { id: '1', detail: 'detail', dateAdded: new Date(), type: 'your mom' },
  undefined
) as UseMutationResult<DescriptionBullet, Error, CheckDescriptionBulletRequestPayload, unknown>;

export const mockGetVersionNumberReturnValue = (versionObject: VersionObject) =>
  mockUseQueryResult<VersionObject>(false, false, versionObject);

export const mockUseAllWorkPackagesReturnValue = (workPackages: WorkPackage[]) =>
  mockUseQueryResult<WorkPackage[]>(false, false, workPackages, new Error());

export const mockUseAllProjectsReturnValue = (projects: Project[]) =>
  mockUseQueryResult<Project[]>(false, false, projects, new Error());

export const mockManyWorkPackages = (workPackages: WorkPackage[]) =>
  mockUseQueryResult<WorkPackage[]>(false, false, workPackages, new Error());
