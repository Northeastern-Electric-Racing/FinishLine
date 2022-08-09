/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult, UseQueryResult } from 'react-query';
import { User } from 'shared';
import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { wbsPipe } from '../../../pipes';
import { useEditSingleProject } from '../../../services/projects.hooks';
import { exampleProject1 as exPrj1 } from '../../../test-support/test-data/projects.stub';
import { useAllUsers, useLogUserIn } from '../../../services/users.hooks';
import {
  mockUseMutationResult,
  mockUseQueryResult
} from '../../../test-support/test-data/test-utils.stub';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser
} from '../../../test-support/test-data/users.stub';
import ProjectEditContainer from './project-edit-container';

jest.mock('../../../services/projects.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseEditSingleProject = useEditSingleProject as jest.Mock<UseMutationResult>;

const mockEditSingleProjectHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseEditSingleProject.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

jest.mock('../../../services/users.hooks');

const mockedUseAllUsers = useAllUsers as jest.Mock<UseQueryResult<User[]>>;

const mockUsersHook = (isLoading: boolean, isError: boolean, data?: User[], error?: Error) => {
  mockedUseAllUsers.mockReturnValue(mockUseQueryResult<User[]>(isLoading, isError, data, error));
};

const mockedUseLogUserIn = useLogUserIn as jest.Mock<UseMutationResult>;

const mockUseLogUserInHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseLogUserIn.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

const users = [exampleAdminUser, exampleAppAdminUser, exampleLeadershipUser];

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ProjectEditContainer proj={exPrj1} exitEditMode={() => null} />
    </RouterWrapper>
  );
};

describe('test suite for ProjectEditContainer', () => {
  beforeEach(() => {
    mockUseLogUserInHook(false, false);
  });

  describe('rendering subcomponents of ProjectEditContainer', () => {
    it('renders title', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getAllByText(`${wbsPipe(exPrj1.wbsNum)} - ${exPrj1.name}`).length).toEqual(2);
    });

    it('renders change request input', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByPlaceholderText('Change Request ID #')).toBeInTheDocument();
    });

    it('render title of ProjectEditDetails', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Project Details (EDIT)')).toBeInTheDocument();
    });

    it('render title of ProjectEditSummary', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Project Summary')).toBeInTheDocument();
    });

    it('render goals list', async () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Goals')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.goals.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render features list', async () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Features')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.features.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render other constraints list', async () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Other Constraints')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.otherConstraints.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render rules list', async () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Goals')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      expect(res.map((item) => item.value)).toEqual(expect.arrayContaining(exPrj1.rules));
    });

    it('render title of ChangesList', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    it('render title of ProjectEditWorkPackagesList', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Work Packages')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
      mockUsersHook(false, false, users);
      mockEditSingleProjectHook(false, false);
      renderComponent();

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('renders the loaded project', () => {
    mockUsersHook(false, false, users);
    mockEditSingleProjectHook(false, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByText(`${wbsPipe(exPrj1.wbsNum)} - ${exPrj1.name}`).length).toEqual(2);
    expect(screen.getByText('Project Details (EDIT)')).toBeInTheDocument();
    expect(screen.getByText('Project Name:')).toBeInTheDocument();
  });

  it('handles the error with message', () => {
    mockUsersHook(false, true, undefined, new Error('error'));
    mockEditSingleProjectHook(false, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('handles the error with no message', () => {
    mockUsersHook(false, true, undefined);
    mockEditSingleProjectHook(false, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('project')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });
});
