import { AuthenticatedUser, DescriptionBullet, User } from 'shared';
import { mockUseMutationResult, mockUseQueryResult } from './test-data/test-utils.stub';
import { exampleAdminUser } from './test-data/users.stub';
import { UseMutationResult } from 'react-query';

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

export const mockCheckDescBulletReturnValue = mockUseMutationResult<DescriptionBullet>(
  false,
  false,
  { id: 1, detail: 'detail', dateAdded: new Date() },
  undefined
);
