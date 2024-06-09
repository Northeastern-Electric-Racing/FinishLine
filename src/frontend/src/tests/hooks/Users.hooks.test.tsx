/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { AxiosResponse } from 'axios';
import { AuthenticatedUser, User } from 'shared';
import wrapper from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../test-support/test-data/test-utils.stub';
import { exampleAllUsers, exampleAdminUser } from '../test-support/test-data/users.stub';
import { getAllUsers, getSingleUser, logUserIn } from '../../apis/users.api';
import { useAllUsers, useSingleUser, useLogUserIn } from '../../hooks/users.hooks';

vi.mock('../../apis/users.api');

describe('user hooks', () => {
  it('handles getting a list of users', async () => {
    const mockedGetAllUsers = getAllUsers as jest.Mock<Promise<AxiosResponse<User[]>>>;
    mockedGetAllUsers.mockReturnValue(mockPromiseAxiosResponse<User[]>(exampleAllUsers));

    const { result, waitFor } = renderHook(() => useAllUsers(), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAllUsers);
  });

  it('handles getting a single user', async () => {
    const mockedGetSingleUser = getSingleUser as jest.Mock<Promise<AxiosResponse<User>>>;
    mockedGetSingleUser.mockReturnValue(mockPromiseAxiosResponse<User>(exampleAdminUser));

    const { result, waitFor } = renderHook(() => useSingleUser('1'), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAdminUser);
  });

  it('handles logging in a user', async () => {
    const mockedLogUserIn = logUserIn as jest.Mock<Promise<AxiosResponse<AuthenticatedUser>>>;
    mockedLogUserIn.mockReturnValue(mockPromiseAxiosResponse<AuthenticatedUser>(exampleAdminUser));

    const { result, waitFor } = renderHook(() => useLogUserIn(), {
      wrapper
    });
    act(() => {
      result.current.mutate(exampleAdminUser.email);
    });

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAdminUser);
  });
});
