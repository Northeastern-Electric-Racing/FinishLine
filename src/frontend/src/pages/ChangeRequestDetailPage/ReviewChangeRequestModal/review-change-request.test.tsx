/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { routes } from '../../../routes';
import { exampleStandardChangeRequest } from '../../../test-support/test-data/change-requests.stub';
import ReviewChangeRequest from './review-change-request';

const renderComponent = (modalShow: boolean, route: string) => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.CHANGE_REQUESTS_BY_ID, route });
  return render(
    <RouterWrapper>
      <ReviewChangeRequest modalShow={modalShow} handleClose={() => null} />
    </RouterWrapper>
  );
};

describe('review change request', () => {
  const route = `${routes.CHANGE_REQUESTS}/${exampleStandardChangeRequest.crId}`;
  it('renders change request review modal', () => {
    renderComponent(true, route);

    expect(
      screen.getByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)
    ).toBeInTheDocument();
  });

  it("doesn't render change request review modal when not shown", () => {
    renderComponent(false, route);

    expect(
      screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)
    ).not.toBeInTheDocument();
  });
});
