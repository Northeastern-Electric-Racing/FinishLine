/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { StageGateChangeRequest } from 'shared';
import { exampleStageGateChangeRequest } from '../../test-support/test-data/change-requests.stub';
import StageGateDetails from '../../../pages/ChangeRequestDetailPage/StageGateDetails';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: StageGateChangeRequest) => {
  return render(<StageGateDetails cr={cr} />);
};

describe('Change request details stage gate cr display element tests', () => {
  const cr: StageGateChangeRequest = exampleStageGateChangeRequest;
  it('Renders confirm completed', () => {
    renderComponent(cr);
    expect(screen.getByText(`Confirm WP Completed`)).toBeInTheDocument();
    expect(screen.getByText(`${cr.confirmDone ? 'YES' : 'NO'}`)).toBeInTheDocument();
  });

  it('Renders leftover budget', () => {
    renderComponent(cr);
    expect(screen.getByText(`Leftover Budget`)).toBeInTheDocument();
    expect(screen.getByText(`$${cr.leftoverBudget}`)).toBeInTheDocument();
  });
});
