import { prismaDesignReview1, prismaDesignReview2, sharedDesignReview1 } from './test-data/design-reviews.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';
import DesignReviewService from '../src/services/design-review.services';
import prisma from '../src/prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../src/utils/errors.utils';

describe('Design Reviews', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Delete Design Review Tests', () => {
    test('Delete Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() => DesignReviewService.deleteDesignReview(batman, prismaDesignReview1.designReviewId)).rejects.toThrow(
        new NotFoundException('Design Review', prismaDesignReview1.designReviewId)
      );
    });
    test('Delete Design Review fails when user is not an admin nor the user who created the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview1);
      await expect(() =>
        DesignReviewService.deleteDesignReview(wonderwoman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete design reviews'));
    });
    test('Delete Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...prismaDesignReview1, dateDeleted: new Date() });
      await expect(() => DesignReviewService.deleteDesignReview(batman, prismaDesignReview1.designReviewId)).rejects.toThrow(
        new DeletedException('Design Review', prismaDesignReview1.designReviewId)
      );
    });
    test('Delete Design Review succeeds when user is admin', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewService.deleteDesignReview(batman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });

    test('Delete Design Review succeeds when user is the creator of the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewService.deleteDesignReview(wonderwoman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });
  });

  describe('Get Single Design Review Tests', () => {
    test('Get Single Design Review fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewService.getSingleDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new NotFoundException('Design Review', prismaDesignReview1.designReviewId));
    });
    test('Get Single Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...prismaDesignReview1, dateDeleted: new Date() });
      await expect(() =>
        DesignReviewService.getSingleDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new DeletedException('Design Review', prismaDesignReview1.designReviewId));
    });

    test('Get Single Design Review succeeds', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview1);

      const result = await DesignReviewService.getSingleDesignReview(wonderwoman, prismaDesignReview1.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sharedDesignReview1);
    });
  });
});
