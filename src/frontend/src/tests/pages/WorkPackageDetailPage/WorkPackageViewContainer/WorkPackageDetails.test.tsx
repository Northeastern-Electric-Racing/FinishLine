/* eslint-disable testing-library/no-container */
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../../test-support/test-utils';
import { WorkPackage } from 'shared';
import { datePipe, fullNamePipe, weeksPipe } from '../../../../utils/pipes';
import {
  exampleResearchWorkPackage,
  exampleDesignWorkPackage,
  exampleManufacturingWorkPackage,
  exampleInstallWorkPackage,
  exampleWorkPackage5
} from '../../../test-support/test-data/work-packages.stub';
import WorkPackageDetails from '../../../../pages/WorkPackageDetailPage/WorkPackageViewContainer/WorkPackageDetails';
import { useAllUsers } from '../../../../hooks/users.hooks';
import { useAuth } from '../../../../hooks/auth.hooks';
import { User } from 'shared';
import { mockAuth, mockUseQueryResult } from '../../../test-support/test-data/test-utils.stub';
import { UseQueryResult } from 'react-query';
import { exampleAdminUser, exampleAppAdminUser, exampleLeadershipUser } from '../../../test-support/test-data/users.stub';
import { Auth } from '../../../../utils/types';

vi.mock('../../../../hooks/users.hooks');
vi.mock('../../../../hooks/auth.hooks');

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;
const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
  mockedUseAuth.mockReturnValue(mockAuth(isLoading, exampleAppAdminUser));
};

const users = [exampleAdminUser, exampleAppAdminUser, exampleLeadershipUser];

const renderComponent = (workPackage = exampleWorkPackage5) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <WorkPackageDetails workPackage={workPackage} dependencies={[]} />
    </RouterWrapper>
  );
};

describe('Work Package Details Component', () => {
  describe('Work Package Stage Button', () => {
    it('does not render a stage label when work package has no stage', () => {
      mockHook(false, false, users);
      const { container } = renderComponent();
      expect(container.getElementsByClassName('MuiChip-label').length).toBe(1);
    });

    it('renders work package research stage label', () => {
      mockHook(false, false, users);
      const { container } = renderComponent(exampleResearchWorkPackage);
      const chips = Array.from(container.getElementsByClassName('MuiChip-label'));
      expect(chips.length).toBe(2);
      expect(chips[0]).toHaveTextContent('Research');
    });

    it('renders work package design stage label', () => {
      mockHook(false, false, users);
      const { container } = renderComponent(exampleDesignWorkPackage);
      const chips = Array.from(container.getElementsByClassName('MuiChip-label'));
      expect(chips.length).toBe(2);
      expect(chips[0]).toHaveTextContent('Design');
    });

    it('renders work package manufacturing stage label', () => {
      mockHook(false, false, users);
      const { container } = renderComponent(exampleManufacturingWorkPackage);
      const chips = Array.from(container.getElementsByClassName('MuiChip-label'));
      expect(chips.length).toBe(2);
      expect(chips[0]).toHaveTextContent('Manufacturing');
    });

    it('renders work package install stage label', () => {
      mockHook(false, false, users);
      const { container } = renderComponent(exampleInstallWorkPackage);
      const chips = Array.from(container.getElementsByClassName('MuiChip-label'));
      expect(chips.length).toBe(2);
      expect(chips[0]).toHaveTextContent('Install');
    });
  });

  describe('Work Package Detail Fields', () => {
    it('renders all the fields, example 1', () => {
      mockHook(false, false, users);
      const wp: WorkPackage = exampleResearchWorkPackage;
      render(<WorkPackageDetails workPackage={wp} dependencies={[]} />);
      expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
      expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.lead)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.manager)}`, { exact: false })).toBeInTheDocument();

      expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.endDate)}`, { exact: false })).toBeInTheDocument();
    });

    it('renders all the fields, example 2', () => {
      mockHook(false, false, users);
      const wp: WorkPackage = exampleDesignWorkPackage;
      render(<WorkPackageDetails workPackage={wp} dependencies={[]} />);
      expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
      expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.lead)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.manager)}`, { exact: false })).toBeInTheDocument();

      expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.endDate)}`, { exact: false })).toBeInTheDocument();
    });

    it('renders all the fields, example 3', () => {
      mockHook(false, false, users);
      const wp: WorkPackage = exampleManufacturingWorkPackage;
      render(<WorkPackageDetails workPackage={wp} dependencies={[]} />);
      expect(screen.getByText(`Work Package Details`)).toBeInTheDocument();
      expect(screen.getByText(`${wp.status}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.lead)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${fullNamePipe(wp.manager)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${weeksPipe(wp.duration)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${datePipe(wp.endDate)}`, { exact: false })).toBeInTheDocument();
    });
  });
});
