/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook } from '@testing-library/react-hooks';
import { AxiosResponse } from 'axios';
import { DesignReview } from 'shared';
import wrapper from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../test-support/test-data/test-utils.stub';
import { exampleAllDesignReviews, exampleDesignReview1 } from '../test-support/test-data/design-reviews.stub';
import { getAllDesignReviews, getSingleDesignReview } from '../../apis/design-reviews.api';
import { useAllDesignReviews, useSingleDesignReview } from '../../hooks/design-reviews.hooks';

vi.mock('../../apis/design-reviews.api');

describe('design review hooks', () => {
  it('handles getting a list of design reviews', async () => {
    const mockedGetAllDesignReviews = getAllDesignReviews as jest.Mock<Promise<AxiosResponse<DesignReview[]>>>;
    mockedGetAllDesignReviews.mockReturnValue(mockPromiseAxiosResponse<DesignReview[]>(exampleAllDesignReviews));

    const { result, waitFor } = renderHook(() => useAllDesignReviews(), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAllDesignReviews);
  });

  it('handles getting a single design review', async () => {
    const mockedGetSingleDesignReview = getSingleDesignReview as jest.Mock<Promise<AxiosResponse<DesignReview>>>;
    mockedGetSingleDesignReview.mockReturnValue(mockPromiseAxiosResponse<DesignReview>(exampleDesignReview1));

    const { result, waitFor } = renderHook(() => useSingleDesignReview('1'), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleDesignReview1);
  });
});
