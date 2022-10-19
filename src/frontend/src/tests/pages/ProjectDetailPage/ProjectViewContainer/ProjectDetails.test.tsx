/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '../../../../hooks/theme.hooks';
import { fullNamePipe } from '../../../../utils/Pipes';
import themes from '../../../../utils/Themes';
import { Theme } from '../../../../utils/Types';
import { exampleProject1, exampleProject3 } from '../../../test-support/test-data/projects.stub';
import ProjectDetails from '../../../../pages/ProjectDetailPage/ProjectViewContainer/ProjectDetails';

jest.mock('../../../../hooks/theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

describe('project details component', () => {
  beforeEach(() => mockHook());

  it('Renders title', () => {
    render(<ProjectDetails project={exampleProject1} />);
    const titleElement = screen.getByText('Project Details');
    expect(titleElement).toBeInTheDocument();
  });

  it('Renders project lead', () => {
    render(<ProjectDetails project={exampleProject3} />);
    const projectNameElement = screen.getByText(fullNamePipe(exampleProject3.projectLead), {
      exact: false
    });
    expect(projectNameElement).toBeInTheDocument();
  });

  it.todo('test display dates');

  it.todo('test display duration');
});
