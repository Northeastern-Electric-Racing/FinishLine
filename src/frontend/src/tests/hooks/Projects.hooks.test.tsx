/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook } from '@testing-library/react-hooks';
import { AxiosResponse } from 'axios';
import { Project } from 'shared';
import wrapper from '../../app/AppContextQuery';
import { mockPromiseAxiosResponse } from '../TestSupport/TestData/TestUtils.stub';
import { exampleAllProjects, exampleProject1 } from '../TestSupport/TestData/Projects.stub';
import { exampleWbsProject1 } from '../TestSupport/TestData/WbsNumbers.stub';
import { getAllProjects, getSingleProject } from '../../apis/projects.api';
import { useAllProjects, useSingleProject } from '../../hooks/Projects.hooks';

jest.mock('../../apis/projects.api');

describe('project hooks', () => {
  it('handles getting a list of projects', async () => {
    const mockedGetAllProjects = getAllProjects as jest.Mock<Promise<AxiosResponse<Project[]>>>;
    mockedGetAllProjects.mockReturnValue(mockPromiseAxiosResponse<Project[]>(exampleAllProjects));

    const { result, waitFor } = renderHook(() => useAllProjects(), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleAllProjects);
  });

  it('handles getting a single project', async () => {
    const mockedGetSingleProject = getSingleProject as jest.Mock<Promise<AxiosResponse<Project>>>;
    mockedGetSingleProject.mockReturnValue(mockPromiseAxiosResponse<Project>(exampleProject1));

    const { result, waitFor } = renderHook(() => useSingleProject(exampleWbsProject1), { wrapper });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(exampleProject1);
  });
});
