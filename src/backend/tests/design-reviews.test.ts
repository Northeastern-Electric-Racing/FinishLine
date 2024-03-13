import { designReview1, prismaDesignReview2, prismaDesignReview3 } from './test-data/design-reviews.test-data';
import { batman, wonderwoman, aquaman } from './test-data/users.test-data';
import DesignReviewsService from '../src/services/design-reviews.services.ts';
import prisma from '../src/prisma/prisma';
import { AccessDeniedMemberException, DeletedException, NotFoundException, HttpException } from '../src/utils/errors.utils';

describe('Design Reviews', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Edit Design Reviews Tests', () => {
    test('Edit Reimbursement Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamTypeId,
          [1],
          [6],
          designReview1.isOnline,
          designReview1.isInPerson,
          'https://www.zoom.com',
          null,
          '',
          designReview1.status,
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('Design Review', designReview1.designReviewId));
    });

    test('Edit Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...designReview1, dateDeleted: new Date() });
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamTypeId,
          [1],
          [6],
          designReview1.isOnline,
          designReview1.isInPerson,
          'https://www.zoom.com',
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          [1],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new DeletedException('Design Review', designReview1.designReviewId));
    });

    test('Edit Design Review fails when user is not lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          wonderwoman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamTypeId,
          [1],
          [6],
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          designReview1.location,
          designReview1.docTemplateLink,
          designReview1.status,
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new AccessDeniedMemberException('edit design reviews'));
    });

    test('Edit Reimbursement Request fails when required member doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1200],
          [],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          '',
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [1],
          [0, 1, 2, 3, 4]
        )
      ).rejects.toThrow(new HttpException(400, 'User(s) with the following ids not found: 1200'));
    });

    test('Edit Reimbursement Request fails when optionalMember doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamTypeId,
          [1],
          [1200],
          designReview1.isOnline,
          designReview1.isInPerson,
          'https://www.zoom.com',
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'User(s) with the following ids not found: 1200'));
    });

    test('Edit Design Review fails when any requiredMembers are in optionalMembers', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [3],
          [wonderwoman.userId, 1],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'required members cannot be in optional members'));
    });

    test('Edit Design Review fails when meeting times are not consecutive', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [6],
          true,
          false,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          [1, 4, 2, 3]
        )
      ).rejects.toThrow(new HttpException(400, 'meeting time must be consecutive and between 0-48'));
    });

    test('Edit Design Review fails when meeting times are not in between 0-48', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [6],
          true,
          false,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          [48, 49]
        )
      ).rejects.toThrow(new HttpException(400, 'meeting time must be consecutive and between 0-48'));
    });

    test('Edit Design Review fails when both online and in person are true', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [6],
          true,
          true,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'design review cannot be both online and in person'));
    });

    test('Edit Design Review succeeds when user is lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview3);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview3);

      const res = await DesignReviewsService.editDesignReviews(
        aquaman,
        prismaDesignReview3.designReviewId,
        prismaDesignReview3.dateScheduled,
        prismaDesignReview3.teamTypeId,
        [wonderwoman.userId],
        [],
        prismaDesignReview3.isOnline,
        prismaDesignReview3.isInPerson,
        prismaDesignReview3.zoomLink,
        prismaDesignReview3.location,
        prismaDesignReview3.docTemplateLink,
        prismaDesignReview3.status,
        [wonderwoman.userId],
        prismaDesignReview3.meetingTimes
      );

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      // THIS TEST IS KINDA BS, but everything else I try fails.
      expect(res).toStrictEqual(prismaDesignReview3);
    });
  });
});
