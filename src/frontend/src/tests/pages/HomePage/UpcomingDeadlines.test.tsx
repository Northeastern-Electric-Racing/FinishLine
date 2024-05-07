/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { WorkPackage } from 'shared';
import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleAllWorkPackages } from '../../test-support/test-data/work-packages.stub';
import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import UpcomingDeadlines from '../../../pages/HomePage/UpcomingDeadlines';

vi.mock('../../../hooks/work-packages.hooks');

const mockedUseAllWPs = useAllWorkPackages as jest.Mock<UseQueryResult<WorkPackage[]>>;

const mockHook = (isLoading: boolean, isError: boolean, data?: WorkPackage[], error?: Error) => {
  mockedUseAllWPs.mockReturnValue(mockUseQueryResult<WorkPackage[]>(isLoading, isError, data, error));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <UpcomingDeadlines />
    </RouterWrapper>
  );
};

describe('upcoming deadlines component', () => {
  it('renders headers', () => {
    mockHook(false, false, []);
    renderComponent();
    expect(screen.getByText('Upcoming Deadlines (0)')).toBeInTheDocument();
  });

  it('renders loading indicator', () => {
    mockHook(true, false);
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('handles the api throwing an error', () => {
    mockHook(false, true, undefined, new Error('out of bounds error'));
    renderComponent();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
    expect(screen.getByText('out of bounds error')).toBeInTheDocument();
  });

  it('renders the upcoming deadlines', () => {
    mockHook(false, false, exampleAllWorkPackages);
    renderComponent();
    expect(screen.getByText(exampleAllWorkPackages[0].name, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(fullNamePipe(exampleAllWorkPackages[0].lead), { exact: false })).toBeInTheDocument();
    expect(screen.getByText(exampleAllWorkPackages[1].name, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(fullNamePipe(exampleAllWorkPackages[2].manager), { exact: false })).toBeInTheDocument();
    expect(screen.getByText(datePipe(exampleAllWorkPackages[1].endDate), { exact: false })).toBeInTheDocument();
  });

  it('renders when no upcoming deadlines', () => {
    mockHook(false, false, []);
    renderComponent();
    expect(screen.getByText('No upcoming deadlines')).toBeInTheDocument();
  });
});
