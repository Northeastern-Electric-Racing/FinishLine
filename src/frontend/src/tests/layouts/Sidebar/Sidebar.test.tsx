/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import Sidebar from '../../../layouts/Sidebar/Sidebar';
import { useGetVersionNumber } from '../../../hooks/misc.hooks';
import { UseQueryResult } from 'react-query';
import { VersionObject } from '../../../utils/types';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';

jest.mock('../../../hooks/misc.hooks');

const mockedUseGetVersionNumber = useGetVersionNumber as jest.Mock<UseQueryResult<VersionObject>>;

const mockVersionNumberHook = (isLoading: boolean, isError: boolean, data?: VersionObject, error?: Error) => {
  mockedUseGetVersionNumber.mockReturnValue(mockUseQueryResult<VersionObject>(isLoading, isError, data, error));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <Sidebar />
    </RouterWrapper>
  );
};

describe('Sidebar Tests', () => {
  it('Renders Navigation Links', () => {
    mockVersionNumberHook(false, false, { tag_name: 'v3.5.4' } as VersionObject);
    renderComponent();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Requests/i)).toBeInTheDocument();
  });
});
