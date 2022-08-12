/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { UseQueryResult } from 'react-query';
import { Project } from 'shared';
import { render, screen } from '../../test-support/test-utils';
import { useSingleProject } from '../../../hooks/Projects.hooks';
import { exampleWbsProject1 } from '../../test-support/test-data/wbs-numbers.stub';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import ProjectPage from '../../../pages/ProjectDetailPage/ProjectPage';
import { exampleProject1 } from '../../test-support/test-data/projects.stub';

jest.mock('../../../pages/ProjectDetailPage/ProjectViewContainer/ProjectViewContainer', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>project view container</div>;
    }
  };
});

jest.mock('../../../pages/ProjectDetailPage/ProjectEditContainer/ProjectEditContainer', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>project edit container</div>;
    }
  };
});

jest.mock('../../../hooks/projects.hooks');

const mockedUseSingleProject = useSingleProject as jest.Mock<UseQueryResult<Project>>;

const mockProjectHook = (isLoading: boolean, isError: boolean, data?: Project, error?: Error) => {
  mockedUseSingleProject.mockReturnValue(
    mockUseQueryResult<Project>(isLoading, isError, data, error)
  );
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  return render(<ProjectPage wbsNum={exampleWbsProject1} />);
};

describe('test suite for Project Page', () => {
  beforeEach(() => {
    mockProjectHook(false, false, exampleProject1);
    jest.spyOn(React, 'useState').mockReturnValue([false, jest.fn]);
  });

  it('should render without crashing', () => {
    renderComponent();
  });

  it('should render the project view container', () => {
    renderComponent();

    expect(screen.getByText('project view container')).toBeInTheDocument();
  });

  it('should render the project edit container', () => {
    jest.spyOn(React, 'useState').mockReturnValue([true, jest.fn]);
    renderComponent();

    expect(screen.getByText('project edit container')).toBeInTheDocument();
  });

  it('should show the loading indicator', () => {
    mockProjectHook(true, false);
    renderComponent();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should show the error page', () => {
    mockProjectHook(false, true);
    renderComponent();

    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });
});
