/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { routerWrapperBuilder, fireEvent, render, screen, act } from '../../test-support/test-utils';
import { ChangeRequest } from 'shared';
import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ChangeRequestDetailsView from '../../../pages/ChangeRequestDetailPage/ChangeRequestDetailsView';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: ChangeRequest, allowed: boolean = false) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ChangeRequestDetailsView changeRequest={cr} isUserAllowedToReview={allowed} isUserAllowedToImplement={allowed} />
    </RouterWrapper>
  );
};

describe('Implement change request permission tests', () => {
  const actionBtnText = 'Implement Change Request';
  const newPrjBtnText = 'Create New Project';
  const newWPBtnText = 'Create New Work Package';

  it('Implementation actions disabled when not allowed', () => {
    renderComponent(exampleStandardChangeRequest);
    act(() => {
      fireEvent.click(screen.getByText(actionBtnText));
    });
    expect(screen.getByText(newPrjBtnText)).toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).toHaveAttribute('aria-disabled');
  });

  it('Implementation actions enabled when allowed', () => {
    renderComponent(exampleStandardChangeRequest, true);
    act(() => {
      fireEvent.click(screen.getByText(actionBtnText));
    });
    expect(screen.getByText(newPrjBtnText)).not.toHaveAttribute('aria-disabled');
    expect(screen.getByText(newWPBtnText)).not.toHaveAttribute('aria-disabled');
  });
});
