/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../test-support/test-utils';
import { WorkPackage } from 'shared';
import { endDatePipe, fullNamePipe, weeksPipe, percentPipe } from '../../../../pipes';
import {
  exampleWorkPackage1,
  exampleWorkPackage2,
  exampleWorkPackage3
} from '../../../../test-support/test-data/work-packages.stub';
import WorkPackageDetails from './work-package-details';
import { useAllUsers } from '../../../../services/users.hooks';
import { User } from 'shared';
import { mockUseQueryResult } from '../../../../test-support/test-data/test-utils.stub';
import { UseQueryResult } from 'react-query';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser
} from '../../../../test-support/test-data/users.stub';

jest.mock('../../../../services/users.hooks');

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;

const mockHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
};

const users = [exampleAdminUser, exampleAppAdminUser, exampleLeadershipUser];

describe.skip('Rendering Work Package Details Component', () => {
  it('renders all the fields, example 1', () => {
    mockHook(false, false, users);
    const wp: WorkPackage = exampleWorkPackage1;
    render(<WorkPackageDetails workPackage={wp} />);
    expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(`${wp.name}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectLead)}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectManager)}`, { exact: false })
    ).toBeInTheDocument();

    expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${wp.startDate.toLocaleDateString()}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(`${wp.progress}%`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(`${wp.timelineStatus}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${percentPipe(wp.expectedProgress)}`, { exact: false })
    ).toBeInTheDocument();
  });

  it('renders all the fields, example 2', () => {
    mockHook(false, false, users);
    const wp: WorkPackage = exampleWorkPackage2;
    render(<WorkPackageDetails workPackage={wp} />);
    expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(`${wp.name}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectLead)}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectManager)}`, { exact: false })
    ).toBeInTheDocument();

    expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${wp.startDate.toLocaleDateString()}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    const progresses = screen.getAllByText(`${percentPipe(wp.progress)}`); // progress and expectedProgress should be equal and return 2 results
    expect(progresses.length).toBe(2);
    expect(screen.getByText(`${wp.timelineStatus}`, { exact: false })).toBeInTheDocument();
  });

  it('renders all the fields, example 3', () => {
    mockHook(false, false, users);
    const wp: WorkPackage = exampleWorkPackage3;
    render(<WorkPackageDetails workPackage={wp} />);
    expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(`${wp.name}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectLead)}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fullNamePipe(wp.projectManager)}`, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${wp.startDate.toLocaleDateString()}`, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    const progresses = screen.getAllByText(`${percentPipe(wp.progress)}`); // progress and expectedProgress should be equal and return 2 results
    expect(progresses.length).toBe(2);
    expect(screen.getByText(`${wp.timelineStatus}`, { exact: false })).toBeInTheDocument();
  });
});
