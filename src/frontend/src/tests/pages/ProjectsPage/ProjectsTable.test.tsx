/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseQueryResult } from 'react-query';
import { Project } from 'shared';
import {
  fireEvent,
  render,
  routerWrapperBuilder,
  screen,
  waitFor,
  wbsRegex
} from '../../TestSupport/TestUtils';
import { fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import { useAllProjects } from '../../../hooks/Projects.hooks';
import { exampleAllProjects } from '../../TestSupport/TestData/Projects.stub';
import { mockUseQueryResult } from '../../TestSupport/TestData/TestUtils.stub';
import ProjectsTable from '../../../pages/ProjectsPage/ProjectsTable';

jest.mock('../../../hooks/Projects.hooks');

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
      <ProjectsTable />
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
});
