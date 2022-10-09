/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import { ChangeRequestExplanation, StandardChangeRequest } from 'shared';
import { exampleStandardChangeRequest as cr } from '../../test-support/test-data/change-requests.stub';
import StandardDetails from '../../../pages/ChangeRequestDetailPage/StandardDetails';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: StandardChangeRequest) => {
  return render(<StandardDetails cr={cr} />);
};

describe('Change request details standard cr display element tests', () => {
  it('Renders what section', () => {
    renderComponent(cr);
    expect(screen.getByText(`What`)).toBeInTheDocument();
    expect(screen.getByText(`${cr.what}`)).toBeInTheDocument();
  });

  it('Renders why section', () => {
    renderComponent(cr);
    expect(screen.getByText(`Why`)).toBeInTheDocument();
    cr.why.forEach((explanation: ChangeRequestExplanation) => {
      expect(screen.getByText(`${explanation.type}`)).toBeInTheDocument();
      expect(screen.getByText(`${explanation.explain}`)).toBeInTheDocument();
    });
  });
});
