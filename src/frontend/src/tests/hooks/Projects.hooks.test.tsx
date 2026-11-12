/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import { ProjectDetail, ProjectGanttItem } from 'shared';
import AppContextQuery from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../test-support/test-data/test-utils.stub';
import { exampleAllProjects, exampleProject1 } from '../test-support/test-data/projects.stub';
import { exampleWbsProject1 } from '../test-support/test-data/wbs-numbers.stub';
import { getAllProjectsGantt, getSingleProject } from '../../apis/projects.api';
import { useAllProjectsGantt, useSingleProject } from '../../hooks/projects.hooks';

// the gantt hook only passes the response through, so any project shape will do
const exampleAllGanttProjects: ProjectGanttItem[] = exampleAllProjects.map((project) => ({ ...project, tasks: [] }));

const wrapper = ({ children }: { children: React.ReactNode }) => <AppContextQuery>{children}</AppContextQuery>;

vi.mock('../../apis/projects.api');

describe('project hooks', () => {
  it('handles getting a list of projects', async () => {
    const mockedGetAllProjects = getAllProjectsGantt as jest.Mock<Promise<AxiosResponse<ProjectGanttItem[]>>>;
    mockedGetAllProjects.mockReturnValue(mockPromiseAxiosResponse<ProjectGanttItem[]>(exampleAllGanttProjects));

    const { result } = renderHook(() => useAllProjectsGantt(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(exampleAllGanttProjects);
  });

  it('handles getting a single project', async () => {
    const mockedGetSingleProject = getSingleProject as jest.Mock<Promise<AxiosResponse<ProjectDetail>>>;
    mockedGetSingleProject.mockReturnValue(mockPromiseAxiosResponse<ProjectDetail>(exampleProject1));

    const { result } = renderHook(() => useSingleProject(exampleWbsProject1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(exampleProject1);
  });
});
