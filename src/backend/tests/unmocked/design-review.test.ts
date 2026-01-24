import { financeMember, supermanAdmin } from '../test-data/users.test-data.js';
import DesignReviewsService from '../../src/services/design-reviews.services.js';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils.js';
import { createTestDesignReview, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import { getUserQueryArgs } from '../../src/prisma-query-args/user.query-args.js';
import { DesignReviewStatus } from 'shared';
import { Design_Review, Organization } from '@prisma/client';

describe('Design Reviews', () => {
  let designReview: Design_Review;
  let organizationId: string;
  let organization: Organization;
  beforeEach(async () => {
    const { dr, organization: org, orgId } = await createTestDesignReview();
    designReview = dr;
    organization = org;
    organizationId = orgId;
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
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('set the status of a design review'));
  });
});
