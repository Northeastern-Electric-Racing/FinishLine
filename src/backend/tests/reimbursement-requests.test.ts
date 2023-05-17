import prisma from '../src/prisma/prisma';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { AccessDeniedAdminOnlyException } from '../src/utils/errors.utils';
import { PopEyes } from './test-data/reimbursement-requests.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';

describe('Reimbursement Requests', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Vendor Tests', () => {
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
});
