/*
Things we need to test for deleting a design review:
- The user is an admin and is allowed to delete the design review
- The user is not an admin but is the user who created the design review thus is allowed to delete the design review
- The user is not an admin nor the user who created the design review and thus can't delete the design review
- The design review is already deleted
- The design review does not exist
*/

import { designReview1 } from './test-data/design-reviews.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';
import DesignReviewService from '../src/services/design-review.services';
import prisma from '../src/prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../src/utils/errors.utils';

describe('Design Reviews', () => {
  describe('Delete Design Review Tests', () => {
    test('Delete Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() => DesignReviewService.deleteDesignReview(batman, designReview1.designReviewId)).rejects.toThrow(
        new NotFoundException('Design Review', designReview1.designReviewId)
      );
    });

    test('Delete Design Review fails when user is not an admin nor the user who created the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() => DesignReviewService.deleteDesignReview(wonderwoman, designReview1.designReviewId)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete design reviews')
      );
    });

    test('Delete Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...designReview1, dateDeleted: new Date() });
      await expect(() => DesignReviewService.deleteDesignReview(batman, designReview1.designReviewId)).rejects.toThrow(
        new DeletedException('Design Review', designReview1.designReviewId)
      );
    });

    // test('Delete Design Review succeeds when user is an admin', async () => {
    //   vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
    //   vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(designReview1);

    //   await DesignReviewService.deleteDesignReview(batman, prismaDesignReview1.designReviewId);

    //   expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
    //   expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
    //   expect(designReview1.dateDeleted).toBeDefined();
    // });
  });
});