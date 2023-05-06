import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import { GiveMeMoneyProduct, GiveMeMyMoney, Parts, PopEyes } from './test-data/reimbursement-requests.test-data';
import { batman, superman } from './test-data/users.test-data';

describe('Reimbursement Requests', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Vendor Tests', () => {
    test('Create Vendor Successfully returns vendor Id', async () => {
      jest.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);

      const vendorId = await ReimbursementRequestService.createVendor('HOLA BUDDY');

      expect(vendorId).toBe('CHICKEN');
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
          GiveMeMyMoney.saboId,
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
          GiveMeMyMoney.saboId,
          batman
        )
      ).rejects.toThrow(new DeletedException('Reimbursement Request', GiveMeMyMoney.reimbursementRequestId));
    });

    test('Edit Reimbursement Request Fails When User is not the recepient', async () => {
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
          GiveMeMyMoney.saboId,
          superman
        )
      ).rejects.toThrow(
        new AccessDeniedException(
          'You do not have access to delete this reimbursement request, only the creator can delete a reimbursement request'
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
          GiveMeMyMoney.saboId,
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
          GiveMeMyMoney.saboId,
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
          GiveMeMyMoney.saboId,
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
        GiveMeMyMoney.saboId,
        batman
      );

      expect(reimbursementRequest).toEqual(GiveMeMyMoney.reimbursementRequestId);
      expect(prisma.reimbursement_Request.update).toHaveBeenCalledTimes(1);
    });
  });
});
