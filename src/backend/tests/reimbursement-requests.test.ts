import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { PopEyes } from './test-data/reimbursement-requests.test-data';

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
});
