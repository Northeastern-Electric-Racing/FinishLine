import { alfred } from '../test-data/users.test-data';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import {
  createTestReimbursementRequest,
  createTestUser,
  resetUsers
} from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { assert } from 'console';
import { ClubAccount, ReimbursementRequest } from 'shared';
import { Account_Code, Vendor } from '@prisma/client';
import { UserWithSecureSettings } from '../../src/utils/auth.utils';


describe('Reimbursement Requests', () => {
  let orgId: string;
  let reimbursementRequest: ReimbursementRequest;
  let createdVendor: Vendor;
  let createdAccountCode: Account_Code;
  let createdUser: UserWithSecureSettings;

  beforeEach(async () => {
    const result = await createTestReimbursementRequest();
    orgId = result.organization.organizationId;
    reimbursementRequest = result.rr;
    createdVendor = result.vendor;
    createdAccountCode = result.accountCode;
    createdUser = result.user;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Deleting a reimbursement request', () => {
    test('Delete Reimbursement Request fails when deleter is not a finance lead', async () => {
      await expect(async () =>
        ReimbursementRequestService.deleteReimbursementRequest(
          reimbursementRequest.reimbursementRequestId,
          await createTestUser(alfred, orgId),
          orgId
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
        orgId
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
        orgId
      );
    });
  });

  describe('Creating a reimbursement request', () => {
    test('Creating a Reimbursement Request Succeeds without a date', async () => {
      const rr = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        createdVendor.vendorId,
        ClubAccount.CASH,
        [],
        [
          {
            name: 'GLUE',
            reason: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0
            },
            cost: 200000
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        orgId
      );

      expect(rr.accountCode).toStrictEqual({ ...createdAccountCode, dateDeleted: undefined });
      expect(rr.account).toEqual(ClubAccount.CASH);
      expect(rr.vendor.vendorId).toEqual(createdVendor.vendorId);
      expect(rr.recipient.userId).toEqual(createdUser.userId);
      expect(rr.dateOfExpense).toEqual(undefined);
      expect(rr.reimbursementProducts).toHaveLength(1);
      expect(rr.reimbursementProducts[0].name).toEqual('GLUE');
      expect(rr.reimbursementProducts[0].cost).toEqual(200000);
      expect((rr.reimbursementProducts[0].reimbursementProductReason as any).wbsNum).toEqual({
        carNumber: 0,
        projectNumber: 0,
        workPackageNumber: 0
      });
      expect(rr.totalCost).toEqual(100);
      expect(rr.reimbursementStatuses).toHaveLength(1);
      expect(rr.reimbursementStatuses[0].type).toEqual('PENDING_LEADERSHIP_APPROVAL');
    });

    test('Creating a Reimbursement Request Succeeds with a date', async () => {
      const rr = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        createdVendor.vendorId,
        ClubAccount.CASH,
        [],
        [
          {
            name: 'GLUE',
            reason: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0
            },
            cost: 200000
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        orgId,
        new Date('12-29-2023')
      );

      expect(rr.accountCode).toStrictEqual({ ...createdAccountCode, dateDeleted: undefined });
      expect(rr.account).toEqual(ClubAccount.CASH);
      expect(rr.vendor.vendorId).toEqual(createdVendor.vendorId);
      expect(rr.recipient.userId).toEqual(createdUser.userId);
      expect(rr.dateOfExpense).toEqual(new Date('12-29-2023'));
      expect(rr.reimbursementProducts).toHaveLength(1);
      expect(rr.reimbursementProducts[0].name).toEqual('GLUE');
      expect(rr.reimbursementProducts[0].cost).toEqual(200000);
      expect((rr.reimbursementProducts[0].reimbursementProductReason as any).wbsNum).toEqual({
        carNumber: 0,
        projectNumber: 0,
        workPackageNumber: 0
      });
      expect(rr.totalCost).toEqual(100);
      expect(rr.reimbursementStatuses).toHaveLength(1);
      expect(rr.reimbursementStatuses[0].type).toEqual('PENDING_LEADERSHIP_APPROVAL');
    });
  });
});
