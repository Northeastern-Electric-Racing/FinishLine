import { ClubAccount } from 'shared';
import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import {
  GiveMeMoneyProduct,
  GiveMeMyMoney,
  Parts,
  PopEyes,
  Status,
  prismaGiveMeMyMoney,
  sharedGiveMeMyMoney
} from './test-data/reimbursement-requests.test-data';
import { alfred, batman, superman, wonderwoman } from './test-data/users.test-data';
import reimbursementRequestQueryArgs from '../src/prisma-query-args/reimbursement-requests.query-args';
import { justiceLeague } from './test-data/teams.test-data';

describe('Reimbursement Requests', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Vendor Tests', () => {
    test('Get all vendors works', async () => {
      jest.spyOn(prisma.vendor, 'findMany').mockResolvedValue([]);

      const res = await ReimbursementRequestService.getAllVendors();

      expect(prisma.vendor.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });

    test('Create Vendor throws error if user is not admin', async () => {
      await expect(ReimbursementRequestService.createVendor(wonderwoman, 'HOLA BUDDY')).rejects.toThrow(
        new AccessDeniedAdminOnlyException('create vendors')
      );
    });

    test('Create Vendor Successfully returns vendor Id', async () => {
      jest.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);

      const vendor = await ReimbursementRequestService.createVendor(batman, 'HOLA BUDDY');

      expect(vendor.vendorId).toBe('CHICKEN');
    });
  });

  describe('Expense Tests', () => {
    test('Create Expense Type fails for non admins', async () => {
      await expect(
        ReimbursementRequestService.createExpenseType(wonderwoman, Parts.name, Parts.code, Parts.allowed)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create expense types'));
    });

    test('Create Expense Type Successfully returns expense type Id', async () => {
      jest.spyOn(prisma.expense_Type, 'create').mockResolvedValue(Parts);

      const expenseType = await ReimbursementRequestService.createExpenseType(batman, Parts.name, Parts.code, Parts.allowed);

      expect(expenseType.expenseTypeId).toBe(Parts.expenseTypeId);
    });
  });

  describe('Get User Reimbursement Request Tests', () => {
    test('successfully calls the Prisma function', async () => {
      // mock prisma calls
      const prismaGetManySpy = jest.spyOn(prisma.reimbursement_Request, 'findMany');
      prismaGetManySpy.mockResolvedValue([prismaGiveMeMyMoney]);

      // act
      const matches = await ReimbursementRequestService.getUserReimbursementRequests(batman);

      // assert
      expect(prismaGetManySpy).toBeCalledTimes(1);
      expect(prismaGetManySpy).toBeCalledWith({
        where: { dateDeleted: null, recipientId: batman.userId },
        ...reimbursementRequestQueryArgs
      });
      expect(matches).toHaveLength(1);
    });
  });

  describe('Edit Reimbursement Request Tests', () => {
    test('Request Fails When Id does not exist', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          GiveMeMyMoney.receiptPictures,
          batman
        )
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Edit Reimbursement Request Fails When Request is deleted', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDeleted: new Date()
      });

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          GiveMeMyMoney.receiptPictures,
          batman
        )
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Edit Reimbursement Request Fails When User is not the recipient', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          GiveMeMyMoney.receiptPictures,
          superman
        )
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this reimbursement request, only the creator can edit a reimbursement request'
        )
      );
    });

    test('Edit Reimbursement Request Fails When Vendor does not exist', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      jest.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          GiveMeMyMoney.receiptPictures,
          batman
        )
      ).rejects.toThrow(new NotFoundException('Vendor', GiveMeMyMoney.vendorId));
    });

    test('Edit Reimbursement Request Fails When Expense Type does not exist', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      jest.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      jest.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [],
          GiveMeMyMoney.receiptPictures,
          batman
        )
      ).rejects.toThrow(new NotFoundException('Expense Type', GiveMeMyMoney.expenseTypeId));
    });

    test('Edit Reimbursement Request Fails When Product Has An Id but does not already exist of reimbursement request', async () => {
      const GiveMeMyMoneyWithoutProduct = {
        ...GiveMeMyMoney,
        reimbursementProducts: []
      };
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithoutProduct);
      jest.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      jest.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(Parts);

      await expect(() =>
        ReimbursementRequestService.editReimbursementRequest(
          GiveMeMyMoney.reimbursementRequestId,
          GiveMeMyMoney.dateOfExpense,
          GiveMeMyMoney.vendorId,
          GiveMeMyMoney.account as ClubAccount,
          GiveMeMyMoney.expenseTypeId,
          GiveMeMyMoney.totalCost,
          [
            {
              id: '1',
              name: 'test',
              cost: 1,
              wbsElementId: 1
            }
          ],
          GiveMeMyMoney.receiptPictures,
          batman
        )
      ).rejects.toThrow(new HttpException(400, 'The following products do not exist: test'));
    });

    test('Edit Reimbursement Succeeds', async () => {
      const GiveMeMyMoneyWithProduct = { ...GiveMeMyMoney, reimbursementProducts: [GiveMeMoneyProduct] };
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithProduct);
      jest.spyOn(prisma.vendor, 'findUnique').mockResolvedValue(PopEyes);
      jest.spyOn(prisma.expense_Type, 'findUnique').mockResolvedValue(Parts);
      jest.spyOn(prisma.reimbursement_Request, 'update').mockResolvedValue(GiveMeMyMoney);
      jest.spyOn(prisma.reimbursement_Product, 'updateMany').mockResolvedValue({ count: 1 });
      jest.spyOn(prisma.reimbursement_Product, 'update').mockResolvedValue(GiveMeMoneyProduct);

      const reimbursementRequest = await ReimbursementRequestService.editReimbursementRequest(
        GiveMeMyMoney.reimbursementRequestId,
        GiveMeMyMoney.dateOfExpense,
        GiveMeMyMoney.vendorId,
        GiveMeMyMoney.account as ClubAccount,
        GiveMeMyMoney.expenseTypeId,
        GiveMeMyMoney.totalCost,
        [
          {
            id: '1',
            name: 'test',
            cost: 1,
            wbsElementId: 1
          }
        ],
        GiveMeMyMoney.receiptPictures,
        batman
      );

      expect(reimbursementRequest.reimbursementRequestId).toEqual(GiveMeMyMoney.reimbursementRequestId);
      expect(prisma.reimbursement_Request.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Reimbursement Request Tests', () => {
    test('Delete Reimbursement Request fails when Id does not exist', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Delete Reimbursement Request fails if project is already deleted', async () => {
      jest
        .spyOn(prisma.reimbursement_Request, 'findUnique')
        .mockResolvedValue({ ...GiveMeMyMoney, dateDeleted: new Date() });
      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Delete Reimbursement Request fails when deleter is not the creator', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);

      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, superman)
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this reimbursement request, only the creator can delete a reimbursement request'
        )
      );
    });

    test('Delete Reimbursement Request fails if it has been approved', async () => {
      const GiveMeMyMoneyWithStatus = { ...GiveMeMyMoney, reimbursementsStatuses: [Status] };
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithStatus);

      await expect(() =>
        ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman)
      ).rejects.toThrow(
        new AccessDeniedException('You cannot delete this reimbursement request. It has already been approved')
      );
    });

    test('Delete Reimbursement Request succeeds', async () => {
      const GiveMeMyMoneyWithStatus = { ...GiveMeMyMoney, reimbursementsStatuses: [] };
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoneyWithStatus);
      jest.spyOn(prisma.reimbursement_Request, 'update').mockResolvedValue({ ...GiveMeMyMoney, dateDeleted: new Date() });

      await ReimbursementRequestService.deleteReimbursementRequest(GiveMeMyMoney.reimbursementRequestId, batman);

      expect(prisma.reimbursement_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.reimbursement_Request.update).toHaveBeenCalledTimes(1);
      expect(GiveMeMyMoney.dateDeleted).toBeDefined();
    });
  });
  describe('Get Reimbursement Requests Tests', () => {
    test('Get all Reimbursement Requests works', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      const res = await ReimbursementRequestService.getAllReimbursementRequests({ ...batman, teams: [justiceLeague] });

      expect(prisma.reimbursement_Request.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
  });

  describe('Get All Expense Types Tests', () => {
    test('Get all Expense Types works', async () => {
      jest.spyOn(prisma.expense_Type, 'findMany').mockResolvedValue([Parts]);

      const res = await ReimbursementRequestService.getAllExpenseTypes();

      expect(prisma.expense_Type.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([Parts]);
    });
  });

  describe('Delivered Tests', () => {
    test('Mark as delivered fails for non submitter', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(wonderwoman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered'));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark as delivered fails for undefined ID', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(batman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark as delivered fails for already marked as delivered', async () => {
      jest
        .spyOn(prisma.reimbursement_Request, 'findUnique')
        .mockResolvedValue({ ...GiveMeMyMoney, dateDelivered: new Date('12/25/203') });

      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(batman, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('Can only be marked as delivered once'));

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
    });

    test('Mark request as delivered successfully', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      jest
        .spyOn(prisma.reimbursement_Request, 'update')
        .mockResolvedValue({ ...GiveMeMyMoney, dateDelivered: new Date('12/25/203') });

      const reimbursementRequest = await ReimbursementRequestService.markReimbursementRequestAsDelivered(
        batman,
        GiveMeMyMoney.reimbursementRequestId
      );

      expect(prisma.reimbursement_Request.findUnique).toBeCalledTimes(1);
      expect(prisma.reimbursement_Request.update).toBeCalledTimes(1);

      expect(reimbursementRequest).toStrictEqual({ ...GiveMeMyMoney, dateDelivered: new Date('12/25/203') });
    });
  });

  describe('Get Single Reimbursement Request Tests', () => {
    test('Get Single Reimbursement Request fails when id does not exist', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Get Single Reimbursement Request fails when id is deleted', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue({
        ...GiveMeMyMoney,
        dateDeleted: new Date()
      });

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Get Single Reimbursement Request fails when user is not the recipient and not a part of finance team', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(GiveMeMyMoney);
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      await expect(() =>
        ReimbursementRequestService.getSingleReimbursementRequest(alfred, GiveMeMyMoney.reimbursementRequestId)
      ).rejects.toThrow(new AccessDeniedException('You do not have access to this reimbursement request'));
    });

    test('Get Single Reimbursement Request succeeds', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(prismaGiveMeMyMoney);
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      const reimbursementRequest = await ReimbursementRequestService.getSingleReimbursementRequest(
        { ...batman, teams: [justiceLeague] },
        GiveMeMyMoney.reimbursementRequestId
      );

      expect(reimbursementRequest).toEqual(sharedGiveMeMyMoney);
    });
  });
});
