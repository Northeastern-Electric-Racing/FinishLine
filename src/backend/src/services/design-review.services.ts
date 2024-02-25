import { Design_Review } from '@prisma/client';
import prisma from '../prisma/prisma';
import { NotFoundException } from '../utils/errors.utils';

export default class DesignReviewService {
  /**
   * Gets the design review with the specified id
   * @param designReviewId the id of the design reivew that's returned
   * @returns the design review with the specified id
   * @throws if the given design review id doesn't exist
   */
  static async getSingleUser(designReviewId: string): Promise<Design_Review> {
    const requestedDesignReview = await prisma.design_Review.findUnique({ where: { designReviewId } });
    if (!requestedDesignReview) throw new NotFoundException('Design Review', designReviewId);
    return requestedDesignReview;
  }
}
