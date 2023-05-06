import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { Parts, PopEyes } from './test-data/reimbursement-requests.test-data';

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

  describe('Expense Tests', () => {
    test('Create Expense Type Successfully returns expense type Id', async () => {
      jest.spyOn(prisma.expense_Type, 'create').mockResolvedValue(Parts);

      const expenseTypeId = await ReimbursementRequestService.createExpenseType(Parts.name, Parts.code, Parts.allowed);

      expect(expenseTypeId).toBe(Parts.expenseTypeId);
    });
  });
});
