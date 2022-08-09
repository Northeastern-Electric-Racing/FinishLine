/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { act, render, screen } from '../../../../test-support/test-utils';
import userEvent from '@testing-library/user-event';
import { WbsElementStatus } from 'shared';
import { fullNamePipe } from '../../../../pipes';
import {
  exampleProject1,
  exampleProject2,
  exampleProject3
} from '../../../../test-support/test-data/projects.stub';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser
} from '../../../../test-support/test-data/users.stub';
import ProjectEditDetails from './project-edit-details';

const projs = [exampleProject1, exampleProject2, exampleProject3];
const users = [exampleAdminUser, exampleAppAdminUser, exampleLeadershipUser];

const mockUpdateSlideDeck = jest.fn();
const mockUpdateTaskList = jest.fn();
const mockUpdateBom = jest.fn();
const mockUpdateGDrive = jest.fn();
const mockUpdateName = jest.fn();
const mockUpdateBudget = jest.fn();
const mockUpdateStatus = jest.fn();
const mockUpdateProjectLead = jest.fn();
const mockUpdateProjectManager = jest.fn();

const renderComponent = (project: any) => {
  return render(
    <ProjectEditDetails
      project={project}
      users={users}
      updateSlideDeck={mockUpdateSlideDeck}
      updateTaskList={mockUpdateTaskList}
      updateBom={mockUpdateBom}
      updateGDrive={mockUpdateGDrive}
      updateName={mockUpdateName}
      updateBudget={mockUpdateBudget}
      updateStatus={mockUpdateStatus}
      updateProjectLead={mockUpdateProjectLead}
      updateProjectManager={mockUpdateProjectManager}
    />
  );
};

describe('project-edit-details', () => {
  describe('the hooks are called properly', () => {
    it('calls the update slide deck hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateSlideDeck).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getAllByDisplayValue(projs[0].slideDeckLink!)[0], 'hello');
      });

      expect(mockUpdateSlideDeck).toBeCalledTimes(5);
    });

    it('calls the update task list hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateTaskList).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getAllByDisplayValue(projs[0].taskListLink!)[1], 'hello');
      });

      expect(mockUpdateTaskList).toBeCalledTimes(5);
    });

    it('calls the update bom hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateBom).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getAllByDisplayValue(projs[0].taskListLink!)[2], 'hi');
      });

      expect(mockUpdateBom).toBeCalledTimes(2);
    });

    it('calls the update google drive hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateGDrive).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getAllByDisplayValue(projs[0].taskListLink!)[3], 'hellohello');
      });

      expect(mockUpdateGDrive).toBeCalledTimes(10);
    });

    it('calls the update name hook when the name field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateName).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getByDisplayValue(projs[0].name), 'a');
      });

      expect(mockUpdateName).toBeCalledTimes(1);
    });

    it('calls the update budget hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateBudget).toBeCalledTimes(0);

      await act(async () => {
        userEvent.type(screen.getByDisplayValue(projs[0].budget), '5');
      });

      expect(mockUpdateBudget).toBeCalledTimes(1);
    });

    it('calls the update status hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateStatus).toBeCalledTimes(0);

      await act(async () => {
        userEvent.selectOptions(screen.getByTestId('status-select'), WbsElementStatus.Inactive);
      });

      expect(mockUpdateStatus).toBeCalledTimes(1);
    });

    it('calls the update project lead hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateProjectLead).toBeCalledTimes(0);

      await act(async () => {
        userEvent.selectOptions(screen.getByTestId('Project Lead:'), fullNamePipe(users[0]));
      });

      expect(mockUpdateProjectLead).toBeCalledTimes(1);
    });

    it('calls the update project managers hook when the field is changed', async () => {
      renderComponent(projs[0]);

      expect(mockUpdateProjectManager).toBeCalledTimes(0);

      await act(async () => {
        userEvent.selectOptions(screen.getByTestId('Project Manager:'), fullNamePipe(users[0]));
      });

      expect(mockUpdateProjectManager).toBeCalledTimes(1);
    });
  });

  describe('Rendering Project Details Component', () => {
    projs.forEach((proj, index) => {
      it(`renders all fields for project ${index + 1}`, async () => {
        renderComponent(proj);

        expect(screen.getByText('Project Details (EDIT)')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'ACTIVE' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'INACTIVE' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'COMPLETE' })).toBeInTheDocument();

        const textboxInputs = ((await screen.findAllByRole('textbox')) as HTMLInputElement[]).map(
          (input) => input.value
        );
        const numberInputs = ((await screen.findAllByRole(
          'spinbutton'
        )) as HTMLInputElement[]).map((input) => parseInt(input.value));

        expect(screen.getByText('Project Name:')).toBeInTheDocument();
        expect(textboxInputs).toContain(proj.name);
        expect(screen.getByText('Project Lead:')).toBeInTheDocument();
        expect(screen.getByText('Project Manager:')).toBeInTheDocument();
        // checks that the options for both dropdowns contain all the users
        users.forEach((user) => {
          expect(screen.getAllByRole('option', { name: fullNamePipe(user) })).toHaveLength(2);
        });
        expect(screen.getByText('Budget:')).toBeInTheDocument();
        expect(numberInputs).toContain(proj.budget);

        // Links
        expect(screen.getByText('Slide Deck')).toBeInTheDocument();
        expect(textboxInputs).toContain(proj.slideDeckLink!);
        expect(screen.getByText('Task List')).toBeInTheDocument();
        expect(textboxInputs).toContain(proj.taskListLink!);
        expect(screen.getByText('BOM')).toBeInTheDocument();
        expect(textboxInputs).toContain(proj.bomLink!);
        expect(screen.getByText('Google Drive')).toBeInTheDocument();
        expect(textboxInputs).toContain(proj.gDriveLink!);
      });
    });
  });
});
