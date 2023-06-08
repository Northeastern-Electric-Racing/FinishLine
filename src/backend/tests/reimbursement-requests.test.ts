import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import { GiveMeMoneyProduct, GiveMeMyMoney, Parts, PopEyes } from './test-data/reimbursement-requests.test-data';
import { batman, superman, wonderwoman } from './test-data/users.test-data';

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
      prismaGetManySpy.mockResolvedValue([GiveMeMyMoney]);

      // act
      const matches = await ReimbursementRequestService.getCurrentUserReimbursementRequests(batman);

      // assert
      expect(prismaGetManySpy).toBeCalledTimes(1);
      expect(prismaGetManySpy).toBeCalledWith({ where: { dateDeleted: null, recipientId: batman.userId } });
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
          GiveMeMyMoney.account,
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
          GiveMeMyMoney.account,
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
          GiveMeMyMoney.account,
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
          GiveMeMyMoney.account,
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
          GiveMeMyMoney.account,
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
          GiveMeMyMoney.account,
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
        GiveMeMyMoney.account,
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

  describe('Get Reimbursement Requests Tests', () => {
    test('Get all Reimbursement Requests works', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findMany').mockResolvedValue([]);

      const res = await ReimbursementRequestService.getAllReimbursementRequests();

      expect(prisma.reimbursement_Request.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
  });
});
