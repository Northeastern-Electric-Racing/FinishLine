/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../TestSupport/TestUtils';
import { exampleAllWorkPackages } from '../../../TestSupport/TestData/WorkPackages.stub';
import ProjectGantt from '../../../../pages/ProjectDetailPage/ProjectViewContainer/ProjectGantt';

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
