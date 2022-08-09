/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../test-support/test-utils';
import { exampleAllWorkPackages } from '../../../../test-support/test-data/work-packages.stub';
import ProjectGantt from './project-gantt';

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  return render(<ProjectGantt workPackages={exampleAllWorkPackages} />);
};

describe('project gantt component', () => {
  it('Renders title', () => {
    renderComponent();
    expect(screen.getByText('Gantt Chart')).toBeInTheDocument();
  });
});
