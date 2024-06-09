import { alfred, batmanAppAdmin } from '../test-data/users.test-data';
import DesignReviewsService from '../../src/services/design-reviews.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createTestDesignReview, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { assert } from 'console';
import { Design_Review } from '@prisma/client';
import { DesignReview, DesignReviewStatus } from 'shared';

describe('Design Reviews', () => {
  let designReview: DesignReview; // should be type: Design_Review
  let orgId: string;
  beforeEach(async () => {
    const result = await createTestDesignReview();
    orgId = result.organization.organizationId;
    // FOR REVIEW: not sure why this type is failing,
    // return type seems to work exactly like other examples (in reference to createTestDesignReview in utils)
    designReview = result.dr;
  });

  afterEach(async () => {
    await resetUsers();
  });

  // change with app admin who is not creator
  test('Set status works when an admin who is not the creator works', async () => {
    const user = await createTestUser(batmanAppAdmin, orgId);

    if (!user) {
      console.log('No user found, please check that the user exists');
      assert(false);
      throw new Error('No user lead found, please check that the user exists');
    }
    const ogDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });

    expect(ogDR?.status).toBe(DesignReviewStatus.UNCONFIRMED);

    await DesignReviewsService.setStatus(user, designReview.designReviewId, DesignReviewStatus.CONFIRMED, orgId);

    const updatedDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });

    expect(updatedDR?.status).toBe(DesignReviewStatus.CONFIRMED);
  });

  // set status works when creator is not admin
  test('Set status works when creator is not admin', async () => {
    const lead = await prisma.user.findUnique({
      where: {
        userId: 6
      },
      include: {
        roles: true
      }
    });

    if (!lead) {
      console.log('No user lead found, please check that the creator of the DR exists and is not an admin');
      assert(false);
      throw new Error('No user lead found, please check that the creator of the DR exists and is not an admin');
    }
    const ogDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });

    expect(ogDR?.status).toBe(DesignReviewStatus.UNCONFIRMED);

    await DesignReviewsService.setStatus(lead, designReview.designReviewId, DesignReviewStatus.CONFIRMED, orgId);

    const updatedDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });

    expect(updatedDR?.status).toBe(DesignReviewStatus.CONFIRMED);
  });

  // fails when user is not admin or creator
  test('Set status fails when user is not admin or creator', async () => {
    await expect(async () =>
      DesignReviewsService.setStatus(
        await createTestUser(alfred, orgId),
        designReview.designReviewId,
        DesignReviewStatus.CONFIRMED,
        orgId
      )
    ).rejects.toThrow(new AccessDeniedException(''));
  });
});
