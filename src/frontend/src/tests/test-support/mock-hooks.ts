import { UseMutationResult } from 'react-query';
import {
  AuthenticatedUser,
  DescriptionBullet,
  Material,
  Project,
  ReimbursementRequestData,
  TaskBoardItem,
  Team,
  TeamJoinRequest,
  UserSettings,
  UserWithRole,
  WorkPackage
} from 'shared';
import { CheckDescriptionBulletRequestPayload } from '../../hooks/description-bullets.hooks';
import { CreateTaskPayload, DeleteTaskPayload, TaskPayload } from '../../hooks/tasks.hooks';
import { VersionObject } from '../../utils/types';
import { mockUseMutationResult, mockUseQueryResult } from './test-data/test-utils.stub';
import { exampleTaskBoardItem1 } from './test-data/tasks.stub';
import { exampleAuthenticatedAdminUser } from './test-data/authenticated-user.stub';

export const mockLogUserInReturnValue = mockUseMutationResult<AuthenticatedUser>(
  false,
  false,
  exampleAuthenticatedAdminUser,
  new Error()
) as UseMutationResult<AuthenticatedUser, Error, string, unknown>;

export const mockLogUserInDevReturnValue = mockUseMutationResult<AuthenticatedUser>(
  false,
  false,
  exampleAuthenticatedAdminUser,
  new Error()
) as UseMutationResult<AuthenticatedUser, Error, string, unknown>;

export const mockGetCurrentUserValue = mockUseMutationResult<AuthenticatedUser>(
  false,
  false,
  exampleAuthenticatedAdminUser,
  new Error()
) as UseMutationResult<AuthenticatedUser, Error, void, unknown>;

export const mockUseAllUsersReturnValue = (users: UserWithRole[]) =>
  mockUseQueryResult<UserWithRole[]>(false, false, users, new Error());

export const mockUseSingleUserSettings = (settings?: UserSettings) =>
  mockUseQueryResult<UserSettings>(
    false,
    false,
    settings || { id: 'id', defaultTheme: 'DARK', slackId: 'slackId' },
    new Error()
  );

export const mockUseUsersFavoriteProjects = (projects?: Project[]) =>
  mockUseQueryResult<Project[]>(false, false, projects || [], new Error());

export const mockUseGetUsersTeams = (teams?: Team[]) => mockUseQueryResult<Team[]>(false, false, teams || [], new Error());

export const mockUseMyTeamJoinRequests = (joinRequests?: TeamJoinRequest[]) =>
  mockUseQueryResult<TeamJoinRequest[]>(false, false, joinRequests || [], new Error());

export const mockCreateTaskReturnValue = mockUseMutationResult<TaskBoardItem>(
  false,
  false,
  exampleTaskBoardItem1,
  new Error()
) as UseMutationResult<TaskBoardItem, Error, CreateTaskPayload, unknown>;

export const mockEditTaskReturnValue = mockUseMutationResult<void>(
  false,
  false,
  undefined,
  new Error()
) as UseMutationResult<void, Error, TaskPayload, unknown>;

export const mockEditTaskAssigneesReturnValue = mockUseMutationResult<TaskBoardItem>(
  false,
  false,
  exampleTaskBoardItem1,
  new Error()
) as UseMutationResult<TaskBoardItem, Error, { taskId: string; assignees: string[] }, unknown>;

export const mockDeleteTaskReturnValue = mockUseMutationResult<void>(
  false,
  false,
  undefined,
  new Error()
) as UseMutationResult<void, Error, DeleteTaskPayload, unknown>;

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

export const mockManyMaterials = (materials: Material[]) =>
  mockUseQueryResult<Material[]>(false, false, materials, new Error());

export const mockUseGetReimbursementRequestProjectData = (rrData: ReimbursementRequestData) =>
  mockUseQueryResult<ReimbursementRequestData>(false, false, rrData, new Error());

export const mockUseMyTeamAsHead = (teamId?: string) =>
  mockUseQueryResult<string | undefined>(false, false, teamId, new Error());
