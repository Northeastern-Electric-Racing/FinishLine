/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { wbsPipe } from '../../../../utils/Pipes';
import * as projectHooks from '../../../../hooks/projects.hooks';
import { exampleProject1 as exPrj1 } from '../../../test-support/test-data/projects.stub';
import * as userHooks from '../../../../hooks/users.hooks';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser
} from '../../../test-support/test-data/users.stub';
import ProjectEditContainer from '../../../../pages/ProjectDetailPage/ProjectEditContainer/ProjectEditContainer';
import {
  mockLogUserInReturnValue,
  mockUseAllUsersReturnValue,
  mockEditProjectReturnValue
} from '../../../test-support/mock-hooks';

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
    jest.spyOn(projectHooks, 'useEditSingleProject').mockReturnValue(mockEditProjectReturnValue);
    jest.spyOn(userHooks, 'useAllUsers').mockReturnValue(mockUseAllUsersReturnValue(users));
    jest.spyOn(userHooks, 'useLogUserIn').mockReturnValue(mockLogUserInReturnValue);
  });

  afterAll(() => jest.clearAllMocks());

  describe('rendering subcomponents of ProjectEditContainer', () => {
    it('renders title', () => {
      renderComponent();
      expect(screen.getAllByText(`${wbsPipe(exPrj1.wbsNum)} - ${exPrj1.name}`).length).toEqual(2);
    });

    it('renders change request input', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('Change Request ID #')).toBeInTheDocument();
    });

    it('render title of ProjectEditDetails', () => {
      renderComponent();
      expect(screen.getByText('Project Details (EDIT)')).toBeInTheDocument();
    });

    it('render title of ProjectEditSummary', () => {
      renderComponent();

      expect(screen.getByText('Project Summary')).toBeInTheDocument();
    });

    it('render goals list', async () => {
      renderComponent();

      expect(screen.getByText('Goals')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.goals.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render features list', async () => {
      renderComponent();

      expect(screen.getByText('Features')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.features.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render other constraints list', async () => {
      renderComponent();

      expect(screen.getByText('Other Constraints')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      exPrj1.otherConstraints.forEach((bullet) => {
        expect(res.map((item) => item.value)).toContain(bullet.detail);
      });
    });

    it('render rules list', async () => {
      renderComponent();

      expect(screen.getByText('Goals')).toBeInTheDocument();
      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      expect(res.map((item) => item.value)).toEqual(expect.arrayContaining(exPrj1.rules));
    });

    it('render title of ChangesList', () => {
      renderComponent();

      expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    it('render title of ProjectEditWorkPackagesList', () => {
      renderComponent();

      expect(screen.getByText('Work Packages')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
      renderComponent();

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('renders the loaded project', () => {
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByText(`${wbsPipe(exPrj1.wbsNum)} - ${exPrj1.name}`).length).toEqual(2);
    expect(screen.getByText('Project Details (EDIT)')).toBeInTheDocument();
    expect(screen.getByText('Project Name:')).toBeInTheDocument();
  });
});
