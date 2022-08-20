/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook } from '@testing-library/react-hooks';
import { AxiosResponse } from 'axios';
import { User } from 'shared';
import wrapper from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../TestSupport/TestData/TestUtils.stub';
import { exampleAllUsers, exampleAdminUser } from '../TestSupport/TestData/Users.stub';
import { getAllUsers, getSingleUser } from '../../apis/Users.api';
import { useAllUsers, useSingleUser } from '../../hooks/Users.hooks';

jest.mock('../../apis/Users.api');

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

    const { result, waitFor } = renderHook(() => useSingleUser(1), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAdminUser);
  });
});
