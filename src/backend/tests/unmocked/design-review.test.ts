import { financeMember, supermanAdmin } from '../test-data/users.test-data';
import DesignReviewsService from '../../src/services/design-reviews.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createTestDesignReview, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { DesignReview, DesignReviewStatus } from 'shared';

describe('Design Reviews', () => {
  let designReview: DesignReview; // should be type: Design_Review
  let organizationId: string;
  beforeEach(async () => {
    await resetUsers();
    // FOR REVIEW, TO BE DELETED: orgId is needed to ensure congruence of created users.
    const { dr, orgId } = await createTestDesignReview();
    designReview = dr;
    organizationId = orgId;
  });

  // change with admin who is not creator
  test('Set status works when an admin who is not the creator sets', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);
    if (!user) {
      console.log('No user found, please check that the user exists');
      throw new Error('No user lead found, please check that the user exists');
    }
    // check status is different prior to setting
    expect(designReview?.status).toBe(DesignReviewStatus.UNCONFIRMED);
    await DesignReviewsService.setStatus(user, designReview.designReviewId, DesignReviewStatus.CONFIRMED, organizationId);
    const updatedDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });
    // check that status changed to correct status
    expect(updatedDR?.status).toBe(DesignReviewStatus.CONFIRMED);
  });

  // Set status works when creator is not admin
  test('Set status works when creator is not admin', async () => {
    // FOR REVIEW: I would think this is required because the shared type is the only thing
    // that seems to returned in test utils (createTestDesignReview method) so in order
    // to reliable get the creator I don't see another way (other than below)
    const ogDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      },
      include: {
        userCreated: true
      }
    });
    // FOR REVIEW, TO BE DELETED: wouldn't be possible with shared type
    const drCreator = ogDR?.userCreated;
    if (!drCreator) {
      console.log('No creator found, please check that the creator exists');
      throw new Error('No creator found, please check that the creator exists');
    }
    await DesignReviewsService.setStatus(
      drCreator,
      designReview.designReviewId,
      DesignReviewStatus.CONFIRMED,
      organizationId
    );
    // FOR REVIEW, TO BE DELETED: this is required to get new status from db.
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
        await createTestUser(financeMember, organizationId),
        designReview.designReviewId,
        DesignReviewStatus.CONFIRMED,
        organizationId
      )
    ).rejects.toThrow(
      new AccessDeniedException('admin and app-admin only have the ability to set the status of a design review')
    );
  });
});
