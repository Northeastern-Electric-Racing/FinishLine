import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { AccessDeniedAdminOnlyException } from '../src/utils/errors.utils';
import { Parts, PopEyes } from './test-data/reimbursement-requests.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';

describe('Reimbursement Requests', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Vendor Tests', () => {
    test('Create Vendor Successfully returns vendor Id', async () => {
      jest.spyOn(prisma.vendor, 'create').mockResolvedValue(PopEyes);

      const reimbursementRequestId = await ReimbursementRequestService.createVendor('HOLA BUDDY');

      expect(reimbursementRequestId).toBe('CHICKEN');
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

      const expenseTypeId = await ReimbursementRequestService.createExpenseType(
        batman,
        Parts.name,
        Parts.code,
        Parts.allowed
      );

      expect(expenseTypeId).toBe(Parts.expenseTypeId);
    });
  });
});
