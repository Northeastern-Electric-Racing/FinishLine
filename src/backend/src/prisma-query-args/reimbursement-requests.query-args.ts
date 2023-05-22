import { Prisma } from '@prisma/client';
import changeRequestQueryArgs from './change-requests.query-args';
import descriptionBulletQueryArgs from './description-bullets.query-args';
import teamQueryArgs from './teams.query-args';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.Reimbursement_RequestArgs>()({
  include: {
    recepient: true,
    /*include: {
        submittedChangeRequests: {
          where: {
            dateDeleted: null
          },
          ...changeRequestQueryArgs
        },
        reviewedChangeRequests: {
          where: {
            dateDeleted: null
          },
          ...changeRequestQueryArgs
        },
        deletedChangeRequests: {
          where: {
            dateDeleted: null
          },
          ...changeRequestQueryArgs
        },
        projectLead: {
          where: {
            dateDeleted: null
          }
        },
        projectManager: {
          where: {
            dateDeleted: null
          }
        },
        teams: {
          ...teamQueryArgs
        },
        deletedWBSElements: {
          where: {
            dateDeleted: null
          }
        },
        checkedDescriptionBullets: {
          where: {
            dateDeleted: null
          },
          ...descriptionBulletQueryArgs
        },
        createdProposedSolutions: {}
      }*/
    // should include any fields?
    vendor: true, // should include any fields?
    expenseType: true // need to include the Reimbursement_Request[]? should include any other fields?
    // should include any other fields?
  }
});

export default reimbursementRequestQueryArgs;
