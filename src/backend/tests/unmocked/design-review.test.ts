import { alfred, batmanAppAdmin, aquamanLeadership } from '../test-data/users.test-data';
import DesignReviewsService from '../../src/services/design-reviews.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createTestDesignReview, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { assert } from 'console';
import { DesignReview, DesignReviewStatus, User } from 'shared';

describe('Design Reviews', () => {
  let designReview: DesignReview; // should be type: Design_Review
  let orgId: string;
  let designReviewId: string;
  beforeEach(async () => {
    await resetUsers();
    const {
      organization: { organizationId },
      dr,
      designReviewId: id
    } = await createTestDesignReview();
    orgId = organizationId;
    designReview = dr;
    designReviewId = id;
  });

  // change with app admin who is not creator
  test('Set status works when an admin who is not the creator works', async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: batmanAppAdmin.email
      }
    });

    if (!user) {
      console.log('No user found, please check that the user exists');
      assert(false);
      throw new Error('No user lead found, please check that the user exists');
    }
    const ogDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId
      }
    });

    expect(ogDR?.status).toBe(DesignReviewStatus.UNCONFIRMED);

    await DesignReviewsService.setStatus(user, designReview.designReviewId, DesignReviewStatus.CONFIRMED, orgId);

    const updatedDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId
      }
    });

    expect(updatedDR?.status).toBe(DesignReviewStatus.CONFIRMED);
  });

  // set status works when creator is not admin
  test('Set status works when creator is not admin', async () => {
    const ogDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId
      },
      include: {
        userCreated: true
      }
    });

    expect(ogDR?.status).toBe(DesignReviewStatus.UNCONFIRMED);
    const drCreator = ogDR?.userCreated;
    if (!drCreator) {
      console.log('No creator found, please check that the creator exists');
      assert(false);
      throw new Error('No creator found, please check that the creator exists');
    }
    await DesignReviewsService.setStatus(drCreator, designReview.designReviewId, DesignReviewStatus.CONFIRMED, orgId);

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
