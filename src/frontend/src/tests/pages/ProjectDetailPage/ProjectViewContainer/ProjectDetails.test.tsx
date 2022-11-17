/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { fullNamePipe } from '../../../../utils/Pipes';
import { exampleProject1, exampleProject3 } from '../../../test-support/test-data/projects.stub';
import ProjectDetails from '../../../../pages/ProjectDetailPage/ProjectViewContainer/ProjectDetails';

describe('project details component', () => {
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
