/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../../utils/routes';
import { exampleStandardChangeRequest } from '../../test-support/test-data/change-requests.stub';
import ReviewChangeRequest from '../../../pages/ChangeRequestDetailPage/ReviewChangeRequest';
import { ChangeRequestStatus } from 'shared';

const renderComponent = (modalShow: boolean, route: string) => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.CHANGE_REQUESTS_BY_ID, route });
  return render(
    <RouterWrapper>
      <ReviewChangeRequest
        cr={{
          // SKIPPING BECAUSE WE CAST IT TO THIS BUT CANT ADD IT TO THE TEST
          // proposedSolutions: [],
          crId: "1",
          identifier: 1,
          submitter: {
            userId: "1",
            firstName: 'a',
            lastName: 'b',
            email: 'c',
            emailId: 'd',
            role: 'APP_ADMIN'
          },
          wbsNum: {
            carNumber: 1,
            projectNumber: 1,
            workPackageNumber: 0
          },
          dateSubmitted: new Date(),
          type: 'ISSUE',
          wbsName: 'a',
          status: ChangeRequestStatus.Open,
          requestedReviewers: []
        }}
        modalShow={modalShow}
        handleClose={() => null}
      />
    </RouterWrapper>
  );
};

describe.skip('review change request', () => {
  const route = `${routes.CHANGE_REQUESTS}/${exampleStandardChangeRequest.crId}`;
  it('renders change request review modal', () => {
    renderComponent(true, route);

    expect(screen.getByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)).toBeInTheDocument();
  });

  it("doesn't render change request review modal when not shown", () => {
    renderComponent(false, route);

    expect(screen.queryByText(`Review Change Request #${exampleStandardChangeRequest.crId}`)).not.toBeInTheDocument();
  });
});
