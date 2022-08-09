/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { Project, WbsElementStatus } from 'shared';
import {
  fireEvent,
  render,
  routerWrapperBuilder,
  screen,
  waitFor,
  wbsRegex
} from '../../test-support/test-utils';
import { fullNamePipe, wbsPipe } from '../../pipes';
import { useAllProjects } from '../../services/projects.hooks';
import {
  exampleAllProjects,
  exampleProject1,
  exampleProject2,
  exampleProject3,
  exampleProject4,
  exampleProject5
} from '../../test-support/test-data/projects.stub';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import ProjectsView, { filterProjects } from './projects-view';

jest.mock('../../services/projects.hooks');

const mockedUseAllProjects = useAllProjects as jest.Mock<UseQueryResult<Project[]>>;

const mockHook = (isLoading: boolean, isError: boolean, data?: Project[], error?: Error) => {
  mockedUseAllProjects.mockReturnValue(
    mockUseQueryResult<Project[]>(isLoading, isError, data, error)
  );
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  render(
    <RouterWrapper>
      <ProjectsView />
    </RouterWrapper>
  );
};

describe('projects table component', () => {
  it('renders the title', async () => {
    mockHook(false, false, []);
    renderComponent();

    expect(screen.getAllByText('Projects').length).toEqual(2);
  });

  it('renders the loading indicator', () => {
    mockHook(true, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  it('handles the api throwing an error', async () => {
    mockHook(false, true);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('handles the api returning an empty array', async () => {
    mockHook(false, false, []);
    renderComponent();

    expect(screen.getAllByText('Projects').length).toEqual(2);
    expect(screen.getByText('No projects to display', { exact: false })).toBeInTheDocument();
  });

  it('handles the api returning a normal array of projects', async () => {
    mockHook(false, false, exampleAllProjects);
    renderComponent();
    await waitFor(() => screen.getByText(wbsPipe(exampleAllProjects[0].wbsNum)));

    expect(screen.getByText('5 weeks')).toBeInTheDocument();
    expect(
      screen.getAllByText(fullNamePipe(exampleAllProjects[1].projectLead))[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(fullNamePipe(exampleAllProjects[2].projectLead))[0]
    ).toBeInTheDocument();
    expect(
      screen.getByText(fullNamePipe(exampleAllProjects[3].projectManager))
    ).toBeInTheDocument();
    expect(screen.getByText(wbsPipe(exampleAllProjects[4].wbsNum))).toBeInTheDocument();

    expect(screen.getAllByText('Projects').length).toEqual(2);
    expect(screen.queryByText('No projects to display', { exact: false })).not.toBeInTheDocument();
  });

  it('handles sorting and reverse sorting the table by wbs num', async () => {
    mockHook(false, false, exampleAllProjects);
    renderComponent();
    await waitFor(() => screen.getByText(wbsPipe(exampleAllProjects[0].wbsNum)));

    const column: string = 'WBS #';
    const expectedWbsOrder = exampleAllProjects.map((prj) => wbsPipe(prj.wbsNum));

    // Default sort is wbs ascending
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele: HTMLElement) => ele.innerHTML)).toEqual(expectedWbsOrder);

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele: HTMLElement) => ele.innerHTML)).toEqual(
      expectedWbsOrder.reverse()
    );
  });

  it('checking if project filtering with no filters works as expected', async () => {
    expect(filterProjects(exampleAllProjects, -1, '', -1, -1)).toStrictEqual(exampleAllProjects);
  });

  it('checking if project filtering with car num works as expected', async () => {
    const answer1 = [exampleProject1, exampleProject2, exampleProject3];
    const answer2 = [exampleProject4, exampleProject5];
    expect(filterProjects(exampleAllProjects, 1, '', -1, -1)).toStrictEqual(answer1);
    expect(filterProjects(exampleAllProjects, 2, '', -1, -1)).toStrictEqual(answer2);
  });

  it('checking if project filtering with status works as expected', async () => {
    const answer_active = [exampleProject1, exampleProject3];
    const answer_inactive = [exampleProject2, exampleProject4];
    const answer_complete = [exampleProject5];
    expect(filterProjects(exampleAllProjects, -1, WbsElementStatus.Active, -1, -1)).toStrictEqual(
      answer_active
    );
    expect(filterProjects(exampleAllProjects, -1, WbsElementStatus.Inactive, -1, -1)).toStrictEqual(
      answer_inactive
    );
    expect(filterProjects(exampleAllProjects, -1, WbsElementStatus.Complete, -1, -1)).toStrictEqual(
      answer_complete
    );
  });

  it('checking if project filtering with project lead works as expected', async () => {
    const answer1 = [exampleProject1, exampleProject2, exampleProject5];
    const answer2 = [exampleProject3, exampleProject4];
    expect(filterProjects(exampleAllProjects, -1, '', 4, -1)).toStrictEqual(answer1);
    expect(filterProjects(exampleAllProjects, -1, '', 3, -1)).toStrictEqual(answer2);
  });

  it('checking if project filtering with project manager works as expected', async () => {
    const answer1 = [exampleProject1];
    const answer2 = [exampleProject2, exampleProject3, exampleProject5];
    const answer3 = [exampleProject4];
    expect(filterProjects(exampleAllProjects, -1, '', -1, 3)).toStrictEqual(answer1);
    expect(filterProjects(exampleAllProjects, -1, '', -1, 5)).toStrictEqual(answer2);
    expect(filterProjects(exampleAllProjects, -1, '', -1, 2)).toStrictEqual(answer3);
  });
});
