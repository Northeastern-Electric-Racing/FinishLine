import { alfred, theVisitor } from '../test-data/users.test-data';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createFinanceTeamAndLead, createTestReimbursementRequest, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { assert } from 'console';

describe('Reimbursement Requests', () => {
  beforeEach(async () => {
    await createFinanceTeamAndLead();
  });

  afterEach(async () => {
    await resetUsers();
  });

  test('Delete Reimbursement Request fails when deleter is not a finance lead', async () => {
    const reimbursement = await createTestReimbursementRequest();
    if (!reimbursement) {
      console.log('Failed to create Reimbursement');
      assert(false);
    }
    await expect(() =>
      ReimbursementRequestService.deleteReimbursementRequest(reimbursement.reimbursementRequestId, alfred)
    ).rejects.toThrow(
      new AccessDeniedException(
        'You do not have access to delete this reimbursement request, only finance leads can delete a reimbursement request'
      )
    );
  });

  test('Delete Reimbursement Request fails when deleter is not the creator', async () => {
    const reimbursement = await createTestReimbursementRequest();
    if (!reimbursement) {
      console.log('Failed to create Reimbursement');
      assert(false);
    }
    const financeHead = await prisma.user.findUnique({
      where: {
        googleAuthId: '1'
      }
    });

    if (!financeHead) {
      console.log('No finance head found, please run createFinanceTeamAndLead before this function');
      assert(false);
    }
    await ReimbursementRequestService.deleteReimbursementRequest(reimbursement.reimbursementRequestId, financeHead);

    await expect(() =>
      ReimbursementRequestService.deleteReimbursementRequest(reimbursement.reimbursementRequestId, financeHead)
    ).rejects.toThrow(
      new AccessDeniedException(
        'You do not have access to delete this reimbursement request, only the creator can delete a reimbursement request'
      )
    );
  });

  test('Delete Reimbursement Request succeeds', async () => {
    const reimbursement = await createTestReimbursementRequest();
    if (!reimbursement) {
      console.log('Failed to create Reimbursement');
      assert(false);
    }
    const financeHead = await prisma.user.findUnique({
      where: {
        googleAuthId: '1'
      }
    });

    if (!financeHead) {
      console.log('No finance head found, please run createFinanceTeamAndLead before this function');
      assert(false);
    }
    await ReimbursementRequestService.deleteReimbursementRequest(reimbursement.reimbursementRequestId, financeHead);
  });
});
