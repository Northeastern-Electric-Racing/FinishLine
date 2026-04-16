import { alfred } from '../test-data/users.test-data.js';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services.js';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { createTestCar, createTestReimbursementRequest, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import { assert } from 'console';
import { addDaysToDate, IndexCode, ReimbursementRequest, AccountCode, OtherProductReason } from 'shared';
import { Organization, Vendor } from '@prisma/client';
import { UserWithSecureSettings } from '../../src/utils/auth.utils.js';

describe('Reimbursement Requests', () => {
  let org: Organization;
  let reimbursementRequest: ReimbursementRequest;
  let createdVendor: Vendor;
  let createdIndexCode: IndexCode;
  let createdAccountCode: AccountCode;
  let createdUser: UserWithSecureSettings;
  let createdOtherProductReason: OtherProductReason;

  beforeEach(async () => {
    const result = await createTestReimbursementRequest();
    org = result.organization;
    reimbursementRequest = result.rr;
    createdVendor = result.vendor;
    createdIndexCode = result.indexCode;
    createdAccountCode = result.accountCode;
    createdUser = result.user;
    createdOtherProductReason = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
      'GENERAL STOCK',
      10,
      createdIndexCode.indexCodeId,
      [createdAccountCode.accountCodeId],
      createdUser,
      org
    );
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Deleting a reimbursement request', () => {
    test('Delete Reimbursement Request fails when deleter is not a finance lead', async () => {
      await expect(async () =>
        ReimbursementRequestService.deleteReimbursementRequest(
          reimbursementRequest.reimbursementRequestId,
          await createTestUser(alfred, org.organizationId),
          org
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
        org
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
        org
      );
    });
  });

  describe('Creating a reimbursement request', () => {
    test('Creating a Reimbursement Request Succeeds without a date', async () => {
      const rr = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        createdVendor.vendorId,
        createdIndexCode.indexCodeId,
        [],
        [
          {
            name: 'GLUE',
            reason: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0
            },
            cost: 200000,
            refundSources: [
              {
                indexCode: createdIndexCode,
                amount: 200
              },
              {
                indexCode: createdIndexCode,
                amount: 800
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      expect(rr.accountCode).toStrictEqual({ ...createdAccountCode, dateDeleted: null });
      expect(rr.indexCode.name).toEqual('CASH');
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
      expect(rr.identifier).toEqual(2);
    });

    test('Creating a Reimbursement Request Succeeds with a date', async () => {
      const rr = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        createdVendor.vendorId,
        createdIndexCode.indexCodeId,
        [],
        [
          {
            name: 'GLUE',
            reason: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0
            },
            cost: 200000,
            refundSources: [
              {
                indexCode: createdIndexCode,
                amount: 200
              },
              {
                indexCode: createdIndexCode,
                amount: 800
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org,
        new Date('12-29-2023')
      );

      expect(rr.accountCode).toStrictEqual({ ...createdAccountCode, dateDeleted: null });
      expect(rr.indexCode.name).toEqual('CASH');
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
      expect(rr.identifier).toEqual(2);
    });
  });

  describe('Marking a reimbursement request as delivered', () => {
    test('cannot mark as delivered if delivery is before expense date', async () => {
      // to get around the type checker
      const rrExpenseDate: Date = reimbursementRequest.dateOfExpense ?? new Date('2022-11-22T00:00:01');

      await expect(async () =>
        ReimbursementRequestService.markReimbursementRequestAsDelivered(
          createdUser,
          reimbursementRequest.reimbursementRequestId,
          org,
          addDaysToDate(rrExpenseDate, -1)
        )
      ).rejects.toThrow(new HttpException(400, 'Items cannot be delivered before the expense date.'));
    });

    test('cannot mark as delivered if delivery is after today', async () => {
      await expect(async () =>
        ReimbursementRequestService.markReimbursementRequestAsDelivered(
          createdUser,
          reimbursementRequest.reimbursementRequestId,
          org,
          addDaysToDate(new Date(), 1)
        )
      ).rejects.toThrow(new HttpException(400, 'Delivery date cannot be in the future.'));
    });

    test('adds delivered date to reimbursement request', async () => {
      // we don't want to just check today - set date of expense to some time in the past
      const oldReimbursementRequest = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        reimbursementRequest.vendor.vendorId,
        reimbursementRequest.indexCode.indexCodeId,
        [],
        [
          {
            name: 'GLUE',
            reason: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0
            },
            cost: 200000,
            refundSources: [
              {
                indexCode: createdIndexCode,
                amount: 200
              },
              {
                indexCode: createdIndexCode,
                amount: 800
              }
            ]
          }
        ],
        reimbursementRequest.accountCode.accountCodeId,
        reimbursementRequest.totalCost,
        org,
        new Date('2022-11-22T00:00:01')
      );

      const dateToSetAsDelivered = addDaysToDate(new Date(), -5);

      const updatedRR = await ReimbursementRequestService.markReimbursementRequestAsDelivered(
        createdUser,
        oldReimbursementRequest.reimbursementRequestId,
        org,
        dateToSetAsDelivered
      );

      expect(updatedRR.dateDelivered).toEqual(dateToSetAsDelivered);
    });
  });

  describe('Testing get all vendors', () => {
    test('gets all vendors, after adding vendor', async () => {
      const vendors = await ReimbursementRequestService.getAllVendors(org);
      expect(vendors.length).toEqual(1);
      expect(vendors[0].name).toEqual('Tesla');
      expect(vendors[0].username).toEqual('nershipping@gmail.com');
      expect(vendors[0].password).toEqual('racecar228!');
      expect(vendors[0].discountCode).toEqual('SAVE50!');
      expect(vendors[0].notes).toEqual('Tax exemption status?');
      await ReimbursementRequestService.createVendor(
        createdUser,
        'Nasa',
        org,
        false,
        [createdUser.userId],
        'Tax exemption status?',
        'nershipping@gmail.com',
        'rar',
        '50!'
      );
      const vendorsAfterAddition = await ReimbursementRequestService.getAllVendors(org);
      expect(vendorsAfterAddition.length).toEqual(2);
    });

    test('get all vendors, after deleted vendor', async () => {
      const vendors = await ReimbursementRequestService.getAllVendors(org);
      await ReimbursementRequestService.deleteVendor(vendors[0].vendorId, createdUser, org);
      const vendorsAfterDeletion = await ReimbursementRequestService.getAllVendors(org);
      expect(vendorsAfterDeletion.length).toEqual(0);
    });
  });

  describe('Testing get single vendor', () => {
    test('gets a single vendors that exists', async () => {
      const singleVendor = await ReimbursementRequestService.getSingleVendor(createdVendor.vendorId, org);
      expect(singleVendor.name).toEqual('Tesla');
      expect(singleVendor.username).toEqual('nershipping@gmail.com');
      expect(singleVendor.password).toEqual('racecar228!');
      expect(singleVendor.discountCode).toEqual('SAVE50!');
      expect(singleVendor.taxExempt).toEqual(true);
      expect(singleVendor.twoFactorContacts).toHaveLength(1);
      expect(singleVendor.notes).toEqual('Tax exemption status?');
    });

    test('throws when vendor does not exists', async () => {
      await expect(async () => ReimbursementRequestService.getSingleVendor('invalidId', org)).rejects.toThrow(
        new NotFoundException('Vendor', 'invalidId')
      );
    });

    test('throws when vendor has been deleted', async () => {
      await ReimbursementRequestService.deleteVendor(createdVendor.vendorId, createdUser, org);
      await expect(async () => ReimbursementRequestService.getSingleVendor(createdVendor.vendorId, org)).rejects.toThrow(
        new DeletedException('Vendor', createdVendor.vendorId)
      );
    });

    test('throws when user does not have acess to this vendor', async () => {
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Test',
          description: 'Test`s organization',
          userCreated: {
            connect: {
              userId: createdUser.userId
            }
          }
        }
      });
      await expect(async () => ReimbursementRequestService.getSingleVendor(createdVendor.vendorId, newOrg)).rejects.toThrow(
        new AccessDeniedException('You do not have access to this vendor')
      );
    });
  });

  describe('Testing edit vendor', () => {
    test('edits a single vendors that exists', async () => {
      const singleVendor = await ReimbursementRequestService.getSingleVendor(createdVendor.vendorId, org);
      expect(singleVendor.name).toEqual('Tesla');
      expect(singleVendor.username).toEqual('nershipping@gmail.com');
      expect(singleVendor.password).toEqual('racecar228!');
      expect(singleVendor.discountCode).toEqual('SAVE50!');
      expect(singleVendor.taxExempt).toEqual(true);
      expect(singleVendor.twoFactorContacts).toHaveLength(1);
      expect(singleVendor.notes).toEqual('Tax exemption status?');
      const editedVendor = await ReimbursementRequestService.editVendor(
        'Google',
        createdVendor.vendorId,
        'ner@gmail.com',
        'racecar',
        'DISCOUNT',
        false,
        [],
        'no notes',
        createdUser,
        org
      );
      expect(editedVendor.name).toEqual('Google');
      expect(editedVendor.username).toEqual('ner@gmail.com');
      expect(editedVendor.password).toEqual('racecar');
      expect(editedVendor.discountCode).toEqual('DISCOUNT');
      expect(editedVendor.taxExempt).toEqual(false);
      expect(editedVendor.notes).toEqual('no notes');
    });
  });

  describe('Testing encryption/decryption of vendor passwords', () => {
    test('creates a vendor (encrypts password), queries vendor (decryptes password)', async () => {
      const createdVendor = await ReimbursementRequestService.createVendor(
        createdUser,
        'Nasa',
        org,
        true,
        [createdUser.userId],
        'Tax exemption status?',
        'nershipping@gmail.com',
        'ORGINAL-PASSWORD',
        '50!'
      );

      expect(createdVendor.password?.length).toEqual(64);
      // password encrypted, will look something like: 'U2FsdGVkX1/mQIqBjSMQ+7un24OuWs0wsCU4MiQNjLWgkAkxaMX9Zk1RDqKhrBI6'

      const returnedVendor = await ReimbursementRequestService.getSingleVendor(createdVendor.vendorId, org);
      expect(returnedVendor.password).toEqual('ORGINAL-PASSWORD');
    });
  });

  describe('Testing get single index code', () => {
    test('gets a single index code that exists', async () => {
      const singleIndexCode = await ReimbursementRequestService.getSingleIndexCode(createdIndexCode.indexCodeId, org);
      expect(singleIndexCode.name).toEqual('CASH');
    });

    test('throws when index code has been deleted', async () => {
      await ReimbursementRequestService.deleteIndexCode(createdIndexCode.indexCodeId, createdUser, org);
      await expect(async () =>
        ReimbursementRequestService.getSingleIndexCode(createdIndexCode.indexCodeId, org)
      ).rejects.toThrow(new DeletedException('Index Code', createdIndexCode.indexCodeId));
    });

    test('throws when index code does not exists', async () => {
      await expect(async () => ReimbursementRequestService.getSingleIndexCode('invalidId', org)).rejects.toThrow(
        new NotFoundException('Index Code', 'invalidId')
      );
    });
  });

  describe('Testing get all index codes', () => {
    test('gets all index codes, after adding index code', async () => {
      const indexCodes = await ReimbursementRequestService.getAllIndexCodes(org);
      expect(indexCodes.length).toEqual(1);
      expect(indexCodes[0].name).toEqual('CASH');
      await ReimbursementRequestService.createIndexCode('BUDGET', '800462', createdUser, org);
      const indexCodesAfterAddition = await ReimbursementRequestService.getAllIndexCodes(org);
      expect(indexCodesAfterAddition.length).toEqual(2);
      expect(indexCodesAfterAddition[1].name).toEqual('BUDGET');
    });
  });

  describe('Testing create index code', () => {
    test('Creating an index code succeeds', async () => {
      const indexCode = await ReimbursementRequestService.createIndexCode('CASH', '830667', createdUser, org);
      expect(indexCode.name).toEqual('CASH');
      expect(indexCode.userCreated.userId).toEqual(createdUser.userId);
    });
  });

  describe('Deleting an index code', () => {
    test('Delete Index Code fails when deleter is not a finance lead', async () => {
      await expect(async () =>
        ReimbursementRequestService.deleteIndexCode(
          createdIndexCode.indexCodeId,
          await createTestUser(alfred, org.organizationId),
          org
        )
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this index code, index codes can only be deleted by their creator or finance leads and above'
        )
      );
    });

    test('Delete Index Code succeeds when the deleter is a finance lead', async () => {
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
      await ReimbursementRequestService.deleteIndexCode(createdIndexCode.indexCodeId, financeLead, org);
    });

    test('Delete Index Code succeeds when the deleter is a head of finance', async () => {
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
      await ReimbursementRequestService.deleteIndexCode(createdIndexCode.indexCodeId, financeHead, org);
    });
  });

  describe('Testing get single other product reason', () => {
    test('gets a single other product reason that exists', async () => {
      const singleOtherProductReason = await ReimbursementRequestService.getSingleOtherReimbursementProductReason(
        createdOtherProductReason.otherProductReasonId,
        org
      );
      expect(singleOtherProductReason.name).toEqual('GENERAL STOCK');
      expect(singleOtherProductReason.budget).toEqual(10);
      expect(singleOtherProductReason.indexCode.indexCodeId).toEqual(createdIndexCode.indexCodeId);
      expect(singleOtherProductReason.userCreated.userId).toEqual(createdUser.userId);
    });

    test('throws when other product reason has been deleted', async () => {
      await ReimbursementRequestService.deleteOtherReimbursementProductReason(
        createdOtherProductReason.otherProductReasonId,
        createdUser,
        org
      );
      await expect(async () =>
        ReimbursementRequestService.getSingleOtherReimbursementProductReason(
          createdOtherProductReason.otherProductReasonId,
          org
        )
      ).rejects.toThrow(
        new DeletedException('Reimbursement Product Other Reason', createdOtherProductReason.otherProductReasonId)
      );
    });

    test('throws when other product reason does not exists', async () => {
      await expect(async () =>
        ReimbursementRequestService.getSingleOtherReimbursementProductReason('invalidId', org)
      ).rejects.toThrow(new NotFoundException('Reimbursement Product Other Reason', 'invalidId'));
    });
  });

  describe('Testing get all other product reasons', () => {
    test('gets all other product reasons, after adding other product reason', async () => {
      const otherProductReasons = await ReimbursementRequestService.getAllOtherReimbursementProductReasons(org);
      expect(otherProductReasons.length).toEqual(1);
      expect(otherProductReasons[0].name).toEqual('GENERAL STOCK');
      expect(otherProductReasons[0].budget).toEqual(10);
      expect(otherProductReasons[0].indexCode.indexCodeId).toEqual(createdIndexCode.indexCodeId);
      expect(otherProductReasons[0].userCreated.userId).toEqual(createdUser.userId);
      await ReimbursementRequestService.createOtherReasonReimbursementProduct(
        'CONSUMABLES',
        100,
        createdIndexCode.indexCodeId,
        [createdAccountCode.accountCodeId],
        createdUser,
        org
      );
      const otherProductReasonsAfterAddition = await ReimbursementRequestService.getAllOtherReimbursementProductReasons(org);
      expect(otherProductReasonsAfterAddition.length).toEqual(2);
      expect(otherProductReasonsAfterAddition[1].name).toEqual('CONSUMABLES');
      expect(otherProductReasonsAfterAddition[1].budget).toEqual(100);
      expect(otherProductReasonsAfterAddition[1].indexCode.indexCodeId).toEqual(createdIndexCode.indexCodeId);
      expect(otherProductReasonsAfterAddition[1].userCreated.userId).toEqual(createdUser.userId);
    });
  });

  describe('Testing create other product reason', () => {
    test('Creating an other product reason succeeds', async () => {
      const otherProductReason = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
        'COMPETITION',
        125,
        createdIndexCode.indexCodeId,
        [createdAccountCode.accountCodeId],
        createdUser,
        org
      );
      expect(otherProductReason.name).toEqual('COMPETITION');
      expect(otherProductReason.budget).toEqual(125);
      expect(otherProductReason.indexCode.indexCodeId).toEqual(createdIndexCode.indexCodeId);
      expect(otherProductReason.userCreated.userId).toEqual(createdUser.userId);
    });
  });

  describe('Deleting an other product reason', () => {
    test('Delete Other Product Reason fails when deleter is not a finance lead', async () => {
      await expect(async () =>
        ReimbursementRequestService.deleteOtherReimbursementProductReason(
          createdOtherProductReason.otherProductReasonId,
          await createTestUser(alfred, org.organizationId),
          org
        )
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this other reimbursement product reason, other reimbursement product reasons can only be deleted by their creator or finance leads and above'
        )
      );
    });

    test('Delete Other Product Reason succeeds when the deleter is a finance lead', async () => {
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
      await ReimbursementRequestService.deleteOtherReimbursementProductReason(
        createdOtherProductReason.otherProductReasonId,
        financeLead,
        org
      );
    });

    test('Delete Other Product Reason succeeds when the deleter is a head of finance', async () => {
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
      await ReimbursementRequestService.deleteOtherReimbursementProductReason(
        createdOtherProductReason.otherProductReasonId,
        financeHead,
        org
      );
    });
  });

  describe('Creating a reimbursement request comment', () => {
    test('Successfully creating a RR comment', async () => {
      const comment = await ReimbursementRequestService.createReimbursementRequestComment(
        createdUser,
        org,
        'Test comment!',
        reimbursementRequest.reimbursementRequestId
      );

      expect(comment.comment).toEqual('Test comment!');
      expect(comment.reimbursementRequestId).toEqual(reimbursementRequest.reimbursementRequestId);
      expect(comment.userCreated.userId).toEqual(createdUser.userId);
    });
    test('Fails when RR id is not found', async () => {
      await expect(
        async () =>
          await ReimbursementRequestService.createReimbursementRequestComment(createdUser, org, 'Test comment!', 'bad ID')
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', 'bad ID'));
    });
  });

  describe('Editing a reimbursement request comment', () => {
    test('Successfully editing a RR comment', async () => {
      const comment = await ReimbursementRequestService.createReimbursementRequestComment(
        createdUser,
        org,
        'Test comment!',
        reimbursementRequest.reimbursementRequestId
      );
      const editedComment = await ReimbursementRequestService.editReimbursementRequestComment(
        createdUser,
        org,
        'Edited',
        comment.reimbursementRequestCommentId
      );

      expect(editedComment.comment).toEqual('Edited');
      expect(comment.reimbursementRequestId).toEqual(editedComment.reimbursementRequestId);
      expect(editedComment.userCreated.userId).toEqual(comment.userCreated.userId);
    });
    test('Fails when RRComment id is not found', async () => {
      await expect(
        async () =>
          await ReimbursementRequestService.editReimbursementRequestComment(createdUser, org, 'Test comment!', 'bad ID')
      ).rejects.toThrow(new NotFoundException('Reimbursement Request Comment', 'bad ID'));
    });
    test('Fails when new comment is the same as existing comment', async () => {
      const comment = await ReimbursementRequestService.createReimbursementRequestComment(
        createdUser,
        org,
        'Test comment!',
        reimbursementRequest.reimbursementRequestId
      );
      await expect(
        async () =>
          await ReimbursementRequestService.editReimbursementRequestComment(
            createdUser,
            org,
            'Test comment!',
            comment.reimbursementRequestCommentId
          )
      ).rejects.toThrow(new HttpException(400, 'New comment matches existing content'));
    });
  });

  describe('Deleting a reimbursement request comment', () => {
    test('Successfully deleting a RR comment', async () => {
      const comment = await ReimbursementRequestService.createReimbursementRequestComment(
        createdUser,
        org,
        'Test comment!',
        reimbursementRequest.reimbursementRequestId
      );
      const deletedComment = await ReimbursementRequestService.deleteReimbursementRequestComment(
        createdUser,
        org,
        comment.reimbursementRequestCommentId
      );
      // checking its not found after deleting
      await expect(
        async () =>
          await ReimbursementRequestService.editReimbursementRequestComment(
            createdUser,
            org,
            'Test comment!',
            deletedComment.reimbursementRequestCommentId
          )
      ).rejects.toThrow(
        new NotFoundException('Reimbursement Request Comment', deletedComment.reimbursementRequestCommentId)
      );
    });
    test('Fails when RRComment id is not found', async () => {
      await expect(
        async () => await ReimbursementRequestService.deleteReimbursementRequestComment(createdUser, org, 'bad ID')
      ).rejects.toThrow(new NotFoundException('Reimbursement Request Comment', 'bad ID'));
    });
  });

  describe('Car filtering for reimbursement request list endpoints', () => {
    let car1RR: ReimbursementRequest;

    beforeEach(async () => {
      await createTestCar(org.organizationId, createdUser.userId, 1);
      car1RR = await ReimbursementRequestService.createReimbursementRequest(
        createdUser,
        createdVendor.vendorId,
        createdIndexCode.indexCodeId,
        [],
        [
          {
            name: 'BOLT',
            reason: { carNumber: 1, projectNumber: 0, workPackageNumber: 0 },
            cost: 500,
            refundSources: [{ indexCode: createdIndexCode, amount: 500 }]
          }
        ],
        createdAccountCode.accountCodeId,
        500,
        org
      );
    });

    describe('getUserReimbursementRequests', () => {
      test('returns only requests whose products belong to the given car', async () => {
        const car0Results = await ReimbursementRequestService.getUserReimbursementRequests(createdUser, org, 0);
        expect(car0Results.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(car0Results.map((r) => r.reimbursementRequestId)).not.toContain(car1RR.reimbursementRequestId);

        const car1Results = await ReimbursementRequestService.getUserReimbursementRequests(createdUser, org, 1);
        expect(car1Results.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
        expect(car1Results.map((r) => r.reimbursementRequestId)).not.toContain(reimbursementRequest.reimbursementRequestId);
      });

      test('returns all requests when no carNumber is provided', async () => {
        const allResults = await ReimbursementRequestService.getUserReimbursementRequests(createdUser, org);
        expect(allResults.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(allResults.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
      });

      test('carNumber 0 filters to only car-0 requests and does not return all requests (Fergus regression)', async () => {
        const fergusResults = await ReimbursementRequestService.getUserReimbursementRequests(createdUser, org, 0);
        expect(fergusResults).toHaveLength(1);
        expect(fergusResults[0].reimbursementRequestId).toBe(reimbursementRequest.reimbursementRequestId);
      });
    });

    describe('getAllReimbursementRequests', () => {
      test('returns only requests whose products belong to the given car', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });

        const car0Results = await ReimbursementRequestService.getAllReimbursementRequests(financeHead, org, 0);
        expect(car0Results.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(car0Results.map((r) => r.reimbursementRequestId)).not.toContain(car1RR.reimbursementRequestId);

        const car1Results = await ReimbursementRequestService.getAllReimbursementRequests(financeHead, org, 1);
        expect(car1Results.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
        expect(car1Results.map((r) => r.reimbursementRequestId)).not.toContain(reimbursementRequest.reimbursementRequestId);
      });

      test('returns all requests when no carNumber is provided', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });
        const allResults = await ReimbursementRequestService.getAllReimbursementRequests(financeHead, org);
        expect(allResults.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(allResults.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
      });

      test('carNumber 0 filters to only car-0 requests and does not return all requests (Fergus regression)', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });
        const fergusResults = await ReimbursementRequestService.getAllReimbursementRequests(financeHead, org, 0);
        expect(fergusResults).toHaveLength(1);
        expect(fergusResults[0].reimbursementRequestId).toBe(reimbursementRequest.reimbursementRequestId);
      });
    });

    describe('getUserAssignedReimbursementRequests', () => {
      test('returns only assigned requests whose products belong to the given car', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });
        const financeMember = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeMember' } });
        await ReimbursementRequestService.assignFinanceMember(
          financeHead,
          org,
          reimbursementRequest.reimbursementRequestId,
          financeMember.userId
        );
        await ReimbursementRequestService.assignFinanceMember(
          financeHead,
          org,
          car1RR.reimbursementRequestId,
          financeMember.userId
        );

        const car0Results = await ReimbursementRequestService.getUserAssignedReimbursementRequests(financeMember, org, 0);
        expect(car0Results.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(car0Results.map((r) => r.reimbursementRequestId)).not.toContain(car1RR.reimbursementRequestId);

        const car1Results = await ReimbursementRequestService.getUserAssignedReimbursementRequests(financeMember, org, 1);
        expect(car1Results.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
        expect(car1Results.map((r) => r.reimbursementRequestId)).not.toContain(reimbursementRequest.reimbursementRequestId);
      });

      test('carNumber 0 filters to only car-0 assigned requests and does not return all (Fergus regression)', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });
        const financeMember = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeMember' } });
        await ReimbursementRequestService.assignFinanceMember(
          financeHead,
          org,
          reimbursementRequest.reimbursementRequestId,
          financeMember.userId
        );
        await ReimbursementRequestService.assignFinanceMember(
          financeHead,
          org,
          car1RR.reimbursementRequestId,
          financeMember.userId
        );

        const fergusResults = await ReimbursementRequestService.getUserAssignedReimbursementRequests(financeMember, org, 0);
        expect(fergusResults).toHaveLength(1);
        expect(fergusResults[0].reimbursementRequestId).toBe(reimbursementRequest.reimbursementRequestId);
      });
    });

    describe('getUsersTeamsReimbursementRequests', () => {
      test('returns only requests whose products belong to the given car', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });

        const car0Results = await ReimbursementRequestService.getUsersTeamsReimbursementRequests(financeHead, org, 0);
        expect(car0Results.map((r) => r.reimbursementRequestId)).toContain(reimbursementRequest.reimbursementRequestId);
        expect(car0Results.map((r) => r.reimbursementRequestId)).not.toContain(car1RR.reimbursementRequestId);

        const car1Results = await ReimbursementRequestService.getUsersTeamsReimbursementRequests(financeHead, org, 1);
        expect(car1Results.map((r) => r.reimbursementRequestId)).toContain(car1RR.reimbursementRequestId);
        expect(car1Results.map((r) => r.reimbursementRequestId)).not.toContain(reimbursementRequest.reimbursementRequestId);
      });

      test('carNumber 0 filters to only car-0 requests and does not return all requests (Fergus regression)', async () => {
        const financeHead = await prisma.user.findUniqueOrThrow({ where: { googleAuthId: 'financeHead' } });
        const fergusResults = await ReimbursementRequestService.getUsersTeamsReimbursementRequests(financeHead, org, 0);
        expect(fergusResults).toHaveLength(1);
        expect(fergusResults[0].reimbursementRequestId).toBe(reimbursementRequest.reimbursementRequestId);
      });
    });
  });

  describe('Editing an other reimbursement product reason', () => {
    test('Successfully editing a other reimbursement product reason', async () => {
      const reason = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
        'GENERAL STOCK',
        10,
        createdIndexCode.indexCodeId,
        [createdAccountCode.accountCodeId],
        createdUser,
        org
      );

      const newIndexCode = await ReimbursementRequestService.createIndexCode(
        'indexCodeName',
        'newIndexCode',
        createdUser,
        org
      );

      const editedReason = await ReimbursementRequestService.editOtherReimbursementProductReason(
        reason.otherProductReasonId,
        org,
        createdUser,
        'indexCodeName',
        5,
        newIndexCode.indexCodeId,
        []
      );

      expect(editedReason.budget).toEqual(5);
      expect(editedReason.indexCode.name).toEqual('indexCodeName');
      expect(editedReason.indexCode.code).toEqual('newIndexCode');
    });

    test('Throws with invalid index code', async () => {
      const reason = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
        'GENERAL STOCK',
        10,
        createdIndexCode.indexCodeId,
        [createdAccountCode.accountCodeId],
        createdUser,
        org
      );

      await expect(
        ReimbursementRequestService.editOtherReimbursementProductReason(
          reason.otherProductReasonId,
          org,
          createdUser,
          'new name',
          10000,
          'bad index code',
          []
        )
      ).rejects.toThrow(new NotFoundException('Index Code', 'bad index code'));
    });
    test('Throws with invalid other reimbursement product reason', async () => {
      const newIndexCode = await ReimbursementRequestService.createIndexCode('x', 'newIndexCode', createdUser, org);

      await expect(
        ReimbursementRequestService.editOtherReimbursementProductReason(
          'bad id',
          org,
          createdUser,
          'name',
          50,
          newIndexCode.code,
          []
        )
      ).rejects.toThrow(new NotFoundException('Reimbursement Product Other Reason', 'bad id'));
    });
  });

  describe('Setting the SABO number on a reimbursement request', () => {
    test('Fails when SABO number is already assigned to a request', async () => {
      await ReimbursementRequestService.setSaboNumber(
        reimbursementRequest.reimbursementRequestId,
        'SABO-001',
        createdUser,
        org
      );
      await expect(
        ReimbursementRequestService.setSaboNumber(reimbursementRequest.reimbursementRequestId, 'SABO-001', createdUser, org)
      ).rejects.toThrow(new HttpException(400, 'This SABO number is already assigned to another reimbursement request.'));
    });

    test('Successfully sets the SABO number', async () => {
      const result = await ReimbursementRequestService.setSaboNumber(
        reimbursementRequest.reimbursementRequestId,
        'SABO-001',
        createdUser,
        org
      );
      expect(result.saboId).toEqual('SABO-001');
    });
  });
});
