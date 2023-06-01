import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { AccessDeniedAdminOnlyException, AccessDeniedException, NotFoundException } from '../src/utils/errors.utils';
import { validateReimbursementProducts } from '../src/utils/reimbursement-requests.utils';
import { Parts, PopEyes } from './test-data/reimbursement-requests.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';

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

  describe('Delivered Tests', () => {
    test('Mark as delivered fails for non admins', async () => {
      await expect(
        ReimbursementRequestService.markReimbursementRequestAsDelivered(wonderwoman, PopEyes.vendorId)
      ).rejects.toThrow(new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered'));
    });

    test('Mark as delivered fails for undefined ID', async () => {
      await expect(ReimbursementRequestService.markReimbursementRequestAsDelivered(wonderwoman, '')).rejects.toThrow(
        new NotFoundException('Reimbursement Request', reimbursementRequestId /* TODO */)
      );
    });

    test('Mark request as delivered successfully', async () => {
      jest.spyOn(prisma.reimbursement_Request, 'findUnique').mockResolvedValue(/* TODO: reimbursement_Request value*/);

      const expenseType = await ReimbursementRequestService.markReimbursementRequestAsDelivered(batman, PopEyes.vendorId);

      expect(/* TODO */).toBe(/* TODO */);
    });
  });
});
