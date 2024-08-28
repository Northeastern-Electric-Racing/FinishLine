import { financeMember, supermanAdmin } from '../test-data/users.test-data';
import DesignReviewsService from '../../src/services/design-reviews.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
import { createTestDesignReview, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { getUserQueryArgs } from '../../src/prisma-query-args/user.query-args';
import { DesignReviewStatus } from 'shared';
import { Design_Review, Organization } from '@prisma/client';

describe('Design Reviews', () => {
  let designReview: Design_Review;
  let organizationId: string;
  let organization: Organization;
  beforeEach(async () => {
    const { dr, organization: org } = await createTestDesignReview();
    designReview = dr;
    organization = org;
    organizationId = org.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  // change with admin who is not creator
  test('Set status works when an admin who is not the creator sets', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);
    await DesignReviewsService.setStatus(user, designReview.designReviewId, DesignReviewStatus.CONFIRMED, organization);
    const updatedDR = await prisma.design_Review.findUnique({
      where: {
        designReviewId: designReview.designReviewId
      }
    });
    // check that status changed to correct status
    expect(updatedDR?.status).toBe(DesignReviewStatus.CONFIRMED);
  });

  // Set status works when creator is not admin
  test('Set status works when set with creator who is not admin', async () => {
    const drCreator = await prisma.user.findUnique({
      where: {
        userId: designReview.userCreatedId
      },
      ...getUserQueryArgs(organizationId)
    });
    if (!drCreator) {
      throw new Error('User not found in database');
    }
    await DesignReviewsService.setStatus(drCreator, designReview.designReviewId, DesignReviewStatus.CONFIRMED, organization);
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
        organization
      )
    ).rejects.toThrow(
      new AccessDeniedException('admin and app-admin only have the ability to set the status of a design review')
    );
  });
});
