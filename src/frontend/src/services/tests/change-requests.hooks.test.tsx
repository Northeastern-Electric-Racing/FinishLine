/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook } from '@testing-library/react-hooks';
import { AxiosResponse } from 'axios';
import { ChangeRequest } from 'shared';
import wrapper from '../../app/app-context-query/app-context-query';
import { mockPromiseAxiosResponse } from '../../test-support/test-data/test-utils.stub';
import {
  exampleAllChangeRequests,
  exampleStageGateChangeRequest
} from '../../test-support/test-data/change-requests.stub';
import { getAllChangeRequests, getSingleChangeRequest } from '../change-requests.api';
import { useAllChangeRequests, useSingleChangeRequest } from '../change-requests.hooks';

jest.mock('../change-requests.api');

describe('change request hooks', () => {
  it('handles getting a list of change requests', async () => {
    const mockedGetAllChangeRequests = getAllChangeRequests as jest.Mock<
      Promise<AxiosResponse<ChangeRequest[]>>
    >;
    mockedGetAllChangeRequests.mockReturnValue(
      mockPromiseAxiosResponse<ChangeRequest[]>(exampleAllChangeRequests)
    );

    const { result, waitFor } = renderHook(() => useAllChangeRequests(), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAllChangeRequests);
  });

  it('handles getting a single change request', async () => {
    const mockedGetSingleChangeRequest = getSingleChangeRequest as jest.Mock<
      Promise<AxiosResponse<ChangeRequest>>
    >;
    mockedGetSingleChangeRequest.mockReturnValue(
      mockPromiseAxiosResponse<ChangeRequest>(exampleStageGateChangeRequest)
    );

    const { result, waitFor } = renderHook(() => useSingleChangeRequest(1), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleStageGateChangeRequest);
  });
});
