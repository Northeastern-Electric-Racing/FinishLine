import { alfred, robinMember, cyborgMember, theVisitorGuest } from '../test-data/users.test-data';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services';
import { AccessDeniedException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { createTestReimbursementRequest, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { addDaysToDate, IndexCode, ReimbursementRequest, ReimbursementStatusType, AccountCode } from 'shared';
import { Organization, Role_Type, Theme, User, Vendor } from '@prisma/client';
import { UserWithSecureSettings } from '../../src/utils/auth.utils';

describe('Reimbursement Requests', () => {
  let org: Organization;
  let reimbursementRequest: ReimbursementRequest;
  let createdVendor: Vendor;
  let createdIndexCode: IndexCode;
  let createdAccountCode: AccountCode;
  let createdUser: UserWithSecureSettings;
  let financeHead: User;
  let financeLead: User;
  let financeMember: User;
  let regularMember: User;
  let anotherMember: User;
  let guestUser: User;

  beforeEach(async () => {
    const result = await createTestReimbursementRequest();
    org = result.organization;
    reimbursementRequest = result.rr;
    createdVendor = result.vendor;
    createdIndexCode = result.indexCode;
    createdAccountCode = result.accountCode;
    createdUser = result.user;

    // Get the pre-created finance team members
    const financeHeadUser = await prisma.user.findUnique({
      where: { googleAuthId: 'financeHead' },
      include: {
        userSettings: true,
        userSecureSettings: true,
        roles: { where: { organizationId: org.organizationId } }
      }
    });
    if (!financeHeadUser) throw new Error('Finance head not found');
    financeHead = financeHeadUser;

    const financeLeadUser = await prisma.user.findUnique({
      where: { googleAuthId: 'financeLead' },
      include: {
        userSettings: true,
        userSecureSettings: true,
        roles: { where: { organizationId: org.organizationId } }
      }
    });
    if (!financeLeadUser) throw new Error('Finance lead not found');
    financeLead = financeLeadUser;

    const financeMemberUser = await prisma.user.findUnique({
      where: { googleAuthId: 'financeMember' },
      include: {
        userSettings: true,
        userSecureSettings: true,
        roles: { where: { organizationId: org.organizationId } }
      }
    });
    if (!financeMemberUser) throw new Error('Finance member not found');
    financeMember = financeMemberUser;

    // Create additional test users
    regularMember = await createTestUser(robinMember, org.organizationId);
    anotherMember = await createTestUser(cyborgMember, org.organizationId);
    guestUser = await createTestUser(theVisitorGuest, org.organizationId);
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
      await ReimbursementRequestService.deleteReimbursementRequest(
        reimbursementRequest.reimbursementRequestId,
        financeLead,
        org
      );
    });

    test('Delete Reimbursement Request succeeds when the deleter is a head of finance', async () => {
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

  describe('Denying reimbursement request', () => {
    test('Valid deny reimbursement request', async () => {
      const rr = await ReimbursementRequestService.createReimbursementRequest(
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
              }
            ]
          }
        ],
        reimbursementRequest.accountCode.accountCodeId,
        reimbursementRequest.totalCost,
        org
      );
      const status = await ReimbursementRequestService.denyReimbursementRequest(rr.reimbursementRequestId, createdUser, org);
      expect(status.type).toEqual(ReimbursementStatusType.DENIED);
    });
    test('Creator of reimbursement request can deny their own', async () => {
      const member: User = await prisma.user.create({
        data: {
          firstName: 'Johnny',
          lastName: 'Bravo',
          googleAuthId: '25',
          email: 'jbravo@gmail.com',
          emailId: 'jbravo'
        }
      });

      await prisma.user_Settings.create({
        data: {
          user: {
            connect: {
              userId: member.userId
            }
          },
          defaultTheme: Theme.DARK,
          slackId: 'slackID'
        }
      });

      await prisma.user_Secure_Settings.create({
        data: {
          userSecureSettingsId: 'member',
          user: {
            connect: {
              userId: member.userId
            }
          },
          nuid: '0012345632323',
          phoneNumber: '23232323',
          street: '123 Gotham St.',
          city: 'Gotham',
          state: 'NY',
          zipcode: '12345'
        }
      });

      await prisma.role.create({
        data: {
          user: {
            connect: {
              userId: member.userId
            }
          },
          roleType: Role_Type.MEMBER,
          organization: {
            connect: {
              organizationId: org.organizationId
            }
          }
        }
      });

      const recipient = await prisma.user.findUnique({
        where: { userId: member.userId },
        include: {
          userSettings: true,
          userSecureSettings: true,
          roles: { where: { organizationId: org.organizationId } }
        }
      });

      if (!recipient) {
        throw new Error('No recipient found');
      }

      const reimbReq = await ReimbursementRequestService.createReimbursementRequest(
        recipient,
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      const status = await ReimbursementRequestService.denyReimbursementRequest(
        reimbReq.reimbursementRequestId,
        recipient,
        org
      );
      expect(status.type).toEqual(ReimbursementStatusType.DENIED);
    });
  });

  describe('Input Reimbursement Request in SABO', () => {
    test('Finance team member can input request in SABO after leadership approval', async () => {
      // Create a reimbursement request
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      // Approve by leadership first
      await ReimbursementRequestService.leadershipApproveReimbursementRequest(rr.reimbursementRequestId, createdUser, org);

      await prisma.receipt.create({
        data: {
          googleFileId: 'test file id',
          name: 'test receipt',
          createdBy: { connect: { userId: createdUser.userId } },
          reimbursementRequest: { connect: { reimbursementRequestId: rr.reimbursementRequestId } }
        }
      });

      await prisma.reimbursement_Request.update({
        where: { reimbursementRequestId: rr.reimbursementRequestId },
        data: { dateOfExpense: new Date() }
      });

      // Set as pending finance
      await ReimbursementRequestService.markPendingFinance(createdUser, rr.reimbursementRequestId, org);

      // Input in SABO by finance team
      const status = await ReimbursementRequestService.inputReimbursementRequestInSabo(
        rr.reimbursementRequestId,
        financeMember,
        org
      );

      expect(status.type).toEqual(ReimbursementStatusType.PENDING_SABO_SUBMISSION);
    });

    test('Cannot input in SABO without leadership approval', async () => {
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      await expect(
        ReimbursementRequestService.inputReimbursementRequestInSabo(rr.reimbursementRequestId, financeMember, org)
      ).rejects.toThrow(new HttpException(400, 'This reimbursement request has not been approved by leadership'));
    });

    test('Non-finance team member cannot input in SABO', async () => {
      await expect(
        ReimbursementRequestService.inputReimbursementRequestInSabo(
          reimbursementRequest.reimbursementRequestId,
          regularMember,
          org
        )
      ).rejects.toThrow(new AccessDeniedException('You are not a member of the finance team!'));
    });
  });

  describe('Mark Reimbursement Request as SABO Submitted', () => {
    test('Recipient can mark request as SABO submitted after input in SABO', async () => {
      // Create a reimbursement request
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      // Approve by leadership
      await ReimbursementRequestService.leadershipApproveReimbursementRequest(rr.reimbursementRequestId, createdUser, org);

      await prisma.receipt.create({
        data: {
          googleFileId: 'test file id',
          name: 'test receipt',
          createdBy: { connect: { userId: createdUser.userId } },
          reimbursementRequest: { connect: { reimbursementRequestId: rr.reimbursementRequestId } }
        }
      });

      await prisma.reimbursement_Request.update({
        where: { reimbursementRequestId: rr.reimbursementRequestId },
        data: { dateOfExpense: new Date() }
      });

      // Set as pending finance
      await ReimbursementRequestService.markPendingFinance(createdUser, rr.reimbursementRequestId, org);

      // Input in SABO by finance team
      await ReimbursementRequestService.inputReimbursementRequestInSabo(rr.reimbursementRequestId, financeMember, org);

      // Mark as SABO submitted by recipient
      const status = await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
        rr.reimbursementRequestId,
        createdUser,
        org
      );

      expect(status.type).toEqual(ReimbursementStatusType.SABO_SUBMITTED);
    });

    test('Cannot mark as SABO submitted without input in SABO', async () => {
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      // Approve by leadership but don't input in SABO
      await ReimbursementRequestService.leadershipApproveReimbursementRequest(rr.reimbursementRequestId, createdUser, org);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(rr.reimbursementRequestId, createdUser, org)
      ).rejects.toThrow(new HttpException(400, 'This reimbursement request has not been inputted into SABO yet'));
    });

    test('Non-recipient cannot mark as SABO submitted', async () => {
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
              }
            ]
          }
        ],
        createdAccountCode.accountCodeId,
        100,
        org
      );

      // Approve by leadership and input in SABO
      await ReimbursementRequestService.leadershipApproveReimbursementRequest(rr.reimbursementRequestId, createdUser, org);

      await prisma.receipt.create({
        data: {
          googleFileId: 'test file id',
          name: 'test receipt',
          createdBy: { connect: { userId: createdUser.userId } },
          reimbursementRequest: { connect: { reimbursementRequestId: rr.reimbursementRequestId } }
        }
      });

      await prisma.reimbursement_Request.update({
        where: { reimbursementRequestId: rr.reimbursementRequestId },
        data: { dateOfExpense: new Date() }
      });

      // Set as pending finance
      await ReimbursementRequestService.markPendingFinance(createdUser, rr.reimbursementRequestId, org);

      // Input in SABO by finance team
      await ReimbursementRequestService.inputReimbursementRequestInSabo(rr.reimbursementRequestId, financeMember, org);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(rr.reimbursementRequestId, anotherMember, org)
      ).rejects.toThrow(
        new AccessDeniedException('Only the recipient of the reimbursement request can mark as submitted to SABO')
      );
    });
  });

  describe('Creating a vendor', () => {
    test('Non-guest users can create vendors', async () => {
      const vendor = await ReimbursementRequestService.createVendor(
        regularMember,
        'Member Vendor',
        org,
        false,
        [],
        'Some notes'
      );

      expect(vendor).not.toBeNull();
      expect(vendor.name).toBe('Member Vendor');
      expect(vendor.addedBy.userId).toBe(regularMember.userId);
    });

    test('Guest users cannot create vendors', async () => {
      await expect(
        ReimbursementRequestService.createVendor(guestUser, 'Guest Vendor', org, false, [], 'Some notes')
      ).rejects.toThrow(new AccessDeniedException('create vendors'));
    });
  });

  describe('Editing a vendor', () => {
    test('Creator can edit their own vendor', async () => {
      const vendor = await ReimbursementRequestService.createVendor(
        regularMember,
        'Creator Vendor',
        org,
        false,
        [],
        'Original notes'
      );

      const updatedVendor = await ReimbursementRequestService.editVendor(
        'Updated Vendor Name',
        vendor.vendorId,
        '',
        '',
        '',
        false,
        [],
        'Updated notes',
        regularMember,
        org
      );

      expect(updatedVendor).not.toBeNull();
      expect(updatedVendor.name).toBe('Updated Vendor Name');
      expect(updatedVendor.notes).toBe('Updated notes');
    });

    test('Non-creator non-finance member cannot edit vendor', async () => {
      await expect(
        ReimbursementRequestService.editVendor(
          'Updated Name',
          createdVendor.vendorId,
          '',
          '',
          '',
          false,
          [],
          'notes',
          anotherMember,
          org
        )
      ).rejects.toThrow(new AccessDeniedException('You are not a member of the finance team!'));
    });

    test('Finance team member can edit any vendor', async () => {
      const updatedVendor = await ReimbursementRequestService.editVendor(
        'Finance Updated Vendor',
        createdVendor.vendorId,
        '',
        '',
        '',
        false,
        [],
        'Finance notes',
        financeMember,
        org
      );

      expect(updatedVendor).not.toBeNull();
      expect(updatedVendor.name).toBe('Finance Updated Vendor');
    });
  });

  describe('Deleting a vendor', () => {
    test('Creator can delete their own vendor', async () => {
      const vendor = await ReimbursementRequestService.createVendor(
        regularMember,
        'Vendor to Delete',
        org,
        false,
        [],
        'Delete me'
      );

      const deletedVendor = await ReimbursementRequestService.deleteVendor(vendor.vendorId, regularMember, org);

      expect(deletedVendor).not.toBeNull();
      expect(deletedVendor.name).toBe('Vendor to Delete');
    });

    test('Non-creator non-finance member cannot delete vendor', async () => {
      await expect(ReimbursementRequestService.deleteVendor(createdVendor.vendorId, anotherMember, org)).rejects.toThrow(
        new AccessDeniedException('You are not a member of the finance team!')
      );
    });

    test('Finance team member can delete any vendor', async () => {
      const deletedVendor = await ReimbursementRequestService.deleteVendor(createdVendor.vendorId, financeMember, org);

      expect(deletedVendor).not.toBeNull();
    });
  });

  describe('Edit Index Code', () => {
    test('Admin can edit index code', async () => {
      const indexCode = await ReimbursementRequestService.createIndexCode('TEST', '123456', financeHead, org);

      const updatedIndexCode = await ReimbursementRequestService.editIndexCode(
        financeHead,
        org,
        indexCode.indexCodeId,
        'UPDATED TEST',
        '654321'
      );

      expect(updatedIndexCode).not.toBeNull();
      expect(updatedIndexCode.name).toBe('UPDATED TEST');
      expect(updatedIndexCode.code).toBe('654321');
    });

    test('Non-admin can edit index code if they are the creator', async () => {
      const updatedIndexCode = await ReimbursementRequestService.editIndexCode(
        regularMember,
        org,
        createdIndexCode.indexCodeId,
        'UPDATED TEST',
        '654321'
      );

      expect(updatedIndexCode).not.toBeNull();
      expect(updatedIndexCode.name).toBe('UPDATED TEST');
      expect(updatedIndexCode.code).toBe('654321');
    });

    test('Cannot edit non-existent index code', async () => {
      await expect(
        ReimbursementRequestService.editIndexCode(financeHead, org, 'non-existent-id', 'Test', '123456')
      ).rejects.toThrow(new NotFoundException('Index Code', 'non-existent-id'));
    });
  });
});
