/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import { WorkPackageDetail } from 'shared';
import AppContextQuery from '../../app/AppContextQuery';
import { GlobalCarFilterProvider } from '../../app/AppGlobalCarFilterContext';
import { mockPromiseAxiosResponse } from '../test-support/test-data/test-utils.stub';
import { exampleResearchWorkPackage, toWorkPackageDetail } from '../test-support/test-data/work-packages.stub';
import { exampleWbsWorkPackage1 } from '../test-support/test-data/wbs-numbers.stub';
import { getSingleWorkPackage } from '../../apis/work-packages.api';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import * as carsHooks from '../../hooks/cars.hooks';
import { exampleAllCars } from '../test-support/test-data/cars.stub';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppContextQuery>
    <GlobalCarFilterProvider>{children}</GlobalCarFilterProvider>
  </AppContextQuery>
);

vi.mock('../../apis/work-packages.api');
vi.mock('../../hooks/cars.hooks');

beforeEach(() => {
  vi.mocked(carsHooks.useGetAllCars).mockReturnValue({ data: exampleAllCars, isLoading: false, error: null } as any);
});

describe('work package hooks', () => {
  it('handles getting a single work package', async () => {
    const workPackage = toWorkPackageDetail(exampleResearchWorkPackage);
    const mockedGetSingleWorkPackage = getSingleWorkPackage as unknown as jest.Mock<
      Promise<AxiosResponse<WorkPackageDetail>>
    >;
    mockedGetSingleWorkPackage.mockReturnValue(mockPromiseAxiosResponse<WorkPackageDetail>(workPackage));

    const { result } = renderHook(() => useSingleWorkPackage(exampleWbsWorkPackage1), {
      wrapper
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(workPackage);
  });
});
