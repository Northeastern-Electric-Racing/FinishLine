import { alfred } from '../test-data/users.test-data';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createTestReimbursementRequest, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { assert } from 'console';
import { Organization, Reimbursement_Request } from '@prisma/client';

describe('Reimbursement Requests', () => {
  let orgId: string;
  let organization: Organization;
  let reimbursementRequest: Reimbursement_Request;
  beforeEach(async () => {
    const result = await createTestReimbursementRequest();
    organization = result.organization;
    orgId = result.organization.organizationId;
    reimbursementRequest = result.rr;
  });

  afterEach(async () => {
    await resetUsers();
  });

  test('Delete Reimbursement Request fails when deleter is not a finance lead', async () => {
    await expect(async () =>
      ReimbursementRequestService.deleteReimbursementRequest(
        reimbursementRequest.reimbursementRequestId,
        await createTestUser(alfred, orgId),
        organization
      )
    ).rejects.toThrow(
      new AccessDeniedException(
        'You do not have access to delete this reimbursement request, reimbursement requests can only be deleted by their creator or finance leads and above'
      )
    );
  });

  test('Delete Reimbursement Request succeeds when the deleter is a finance lead', async () => {
    const financeLead = await prisma.user.findUnique({
      where: {
        googleAuthId: 'financeLead'
      }
    });

    if (!financeLead) {
      console.log('No finance lead found, please run createFinanceTeamAndLead before this function');
      assert(false);
      throw new Error('No finance lead found, please run createFinanceTeamAndLead before this function');
    }
    await ReimbursementRequestService.deleteReimbursementRequest(
      reimbursementRequest.reimbursementRequestId,
      financeLead,
      organization
    );
  });

  test('Delete Reimbursement Request succeeds when the deleter is a head of finance', async () => {
    const financeHead = await prisma.user.findUnique({
      where: {
        googleAuthId: 'financeHead'
      }
    });

    if (!financeHead) {
      console.log('No finance head found, please run createFinanceTeamAndLead before this function');
      assert(false);
      throw new Error('No finance head found, please run createFinanceTeamAndLead before this function');
    }
    await ReimbursementRequestService.deleteReimbursementRequest(
      reimbursementRequest.reimbursementRequestId,
      financeHead,
      organization
    );
  });
});
