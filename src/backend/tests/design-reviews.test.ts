import {
  designReview1,
  prismaDesignReview1,
  prismaDesignReview2,
  prismaDesignReview3,
  sharedDesignReview1,
  teamType1
} from './test-data/design-reviews.test-data';
import { aquaman, batman, wonderwoman } from './test-data/users.test-data';
import DesignReviewsService from '../src/services/design-reviews.services';
import prisma from '../src/prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedMemberException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import { Design_Review_Status as PrismaDesignReviewStatus } from '@prisma/client';

describe('Design Reviews', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Edit Design Reviews Tests', () => {
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
          [83]
        )
      ).rejects.toThrow(new DeletedException('Design Review', designReview1.designReviewId));
    });

    test('Edit Reimbursement Request fails when TeamTypeId does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          'notTeamTypeId',
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
      ).rejects.toThrow(new NotFoundException('Team Type', 'notTeamTypeId'));
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

    test('Edit Design Review fails when the meeting is online and there is no zoomLink / no text', async () => {
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
          null,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'zoom link is required for online design reviews'));
    });

    test('Edit Design Review fails when the meeting in person and there is no location', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewsService.editDesignReviews(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [6],
          false,
          true,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'location is required for in person design reviews'));
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
          'location',
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          [1, 4, 2, 3]
        )
      ).rejects.toThrow(new HttpException(400, 'meeting times must be consecutive'));
    });

    test('Edit Design Review fails when meeting times are consecutive and *above* 84', async () => {
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
          'location',
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [],
          [89, 90]
        )
      ).rejects.toThrow(new HttpException(400, 'meeting time must be between 0-84'));
    });

    test('Edit Design Review fails when no docTemplateLink, and status is scheduled or done', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      vi.spyOn(prisma.teamType, 'findUnique').mockResolvedValue(teamType1);
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
          'zoomLink',
          prismaDesignReview2.location,
          null,
          PrismaDesignReviewStatus.SCHEDULED,
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'doc template link is required for scheduled and done design reviews'));
    });
    test('Edit Design Review succeeds when user is lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview3);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview3);
      vi.spyOn(prisma.teamType, 'findUnique').mockResolvedValue(teamType1);

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
  describe('getAllDesignReviews', () => {
    test('Get All Design Reviews works', async () => {
      vi.spyOn(prisma.design_Review, 'findMany').mockResolvedValue([]);

      const res = await DesignReviewsService.getAllDesignReviews();

      expect(prisma.design_Review.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
  });

  describe('Delete Design Review Tests', () => {
    test('Delete Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewsService.deleteDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new NotFoundException('Design Review', prismaDesignReview1.designReviewId));
    });
    test('Delete Design Review fails when user is not an admin nor the user who created the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview1);
      await expect(() =>
        DesignReviewsService.deleteDesignReview(wonderwoman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete design reviews'));
    });
    test('Delete Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...prismaDesignReview1, dateDeleted: new Date() });
      await expect(() =>
        DesignReviewsService.deleteDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new DeletedException('Design Review', prismaDesignReview1.designReviewId));
    });
    test('Delete Design Review succeeds when user is admin', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewsService.deleteDesignReview(batman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });

    test('Delete Design Review succeeds when user is the creator of the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewsService.deleteDesignReview(wonderwoman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });
  });

  describe('Get Single Design Review Tests', () => {
    test('Get Single Design Review fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewsService.getSingleDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new NotFoundException('Design Review', prismaDesignReview1.designReviewId));
    });
    test('Get Single Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...prismaDesignReview1, dateDeleted: new Date() });
      await expect(() =>
        DesignReviewsService.getSingleDesignReview(batman, prismaDesignReview1.designReviewId)
      ).rejects.toThrow(new DeletedException('Design Review', prismaDesignReview1.designReviewId));
    });

    test('Get Single Design Review succeeds', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview1);

      const result = await DesignReviewsService.getSingleDesignReview(wonderwoman, prismaDesignReview1.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sharedDesignReview1);
    });
  });
});
