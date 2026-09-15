/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { AxiosResponse } from 'axios';
import { AuthenticatedUser, User } from 'shared';
import wrapper from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../test-support/test-data/test-utils.stub';
import { exampleAllUsers, exampleAdminUser } from '../test-support/test-data/users.stub';
import { getAllOrgUsers, getSingleUser, logUserIn } from '../../apis/users.api';
import { useAllUsers, useSingleUser, useLogUserIn } from '../../hooks/users.hooks';
import { exampleAuthenticatedAdminUser } from '../test-support/test-data/authenticated-user.stub';

vi.mock('../../apis/users.api');

describe('user hooks', () => {
  it('handles getting a list of users', async () => {
    const mockedGetAllOrgUsers = getAllOrgUsers as jest.Mock<Promise<AxiosResponse<User[]>>>;
    mockedGetAllOrgUsers.mockReturnValue(mockPromiseAxiosResponse<User[]>(exampleAllUsers));

    const { result } = renderHook(() => useAllUsers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(exampleAllUsers);
  });

  it.skip('handles getting a single user', async () => {
    const mockedGetSingleUser = getSingleUser as jest.Mock<Promise<AxiosResponse<User>>>;
    mockedGetSingleUser.mockReturnValue(mockPromiseAxiosResponse<User>(exampleAdminUser));

    const { result } = renderHook(() => useSingleUser('1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(exampleAdminUser);
  });

  it.skip('handles logging in a user', async () => {
    const mockedLogUserIn = logUserIn as jest.Mock<Promise<AxiosResponse<AuthenticatedUser>>>;
    mockedLogUserIn.mockReturnValue(mockPromiseAxiosResponse<AuthenticatedUser>(exampleAuthenticatedAdminUser));

    const { result } = renderHook(() => useLogUserIn(), {
      wrapper
    });

    act(() => {
      result.current.mutate(exampleAdminUser.email);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(exampleAdminUser);
  });
});
