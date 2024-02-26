import { DesignReview, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { User } from '@prisma/client';
import designReviewQueryArgs from '../prisma-query-args/design-review.query-args';
import { designReviewTransformer } from '../transformers/design-review.transformer';

export default class DesignReviewService {
  /**
   * Deletes a design review
   * @param submitter the user who deleted the design review
   * @param designReviewId the id of the design review to be deleted
   */

  static async deleteDesignReview(submitter: User, designReviewId: string): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId }
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);

    if (!(isAdmin(submitter.role) || submitter.userId === designReview.userCreatedId))
      throw new AccessDeniedAdminOnlyException('delete design reviews');

    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

    const deletedDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      data: { dateDeleted: new Date(), userDeleted: { connect: { userId: submitter.userId } } },
      ...designReviewQueryArgs
    });

    return designReviewTransformer(deletedDesignReview);
  }
}
