/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { ActivationChangeRequest } from 'shared';
import { datePipe } from '../../../utils/pipes';
import { exampleActivationChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ActivationDetails from '../../../pages/ChangeRequestDetailPage/ActivationDetails';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: ActivationChangeRequest) => {
  return render(<ActivationDetails cr={cr} />);
};

describe('Change request details activation cr display element tests', () => {
  const cr: ActivationChangeRequest = exampleActivationChangeRequest;

  it('Renders everything', () => {
    renderComponent(cr);
    expect(screen.getByText(`Project Lead`)).toBeInTheDocument();
    expect(screen.getByText(`${cr.projectLead.firstName} ${cr.projectLead.lastName}`)).toBeInTheDocument();
    expect(screen.getByText(`Project Manager`)).toBeInTheDocument();
    expect(screen.getByText(`${cr.projectManager.firstName} ${cr.projectManager.lastName}`)).toBeInTheDocument();
    expect(screen.getByText(`Start Date`)).toBeInTheDocument();
    expect(screen.getByText(`${datePipe(cr.startDate)}`)).toBeInTheDocument();
  });
});
