import { designReview1, prismaDesignReview2 } from './test-data/design-review.test-data';
import { batman, wonderwoman, aquaman } from './test-data/users.test-data';
import DesignReviewService from '../src/services/design-review.services.ts';
import prisma from '../src/prisma/prisma';
import { AccessDeniedMemberException, DeletedException, NotFoundException, HttpException } from '../src/utils/errors.utils';

describe('Design Reviews', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Edit Design Review Tests', () => {
    test('Edit Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [1],
          [],
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('Design Review', designReview1.designReviewId));
    });

    test('Edit Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...designReview1, dateDeleted: new Date() });
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [],
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new DeletedException('Design Review', designReview1.designReviewId));
    });

    test('Edit Design Review fails when user is not lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [1],
          [],
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new AccessDeniedMemberException('edit design reviews'));
    });

    test('Edit Reimbursment Request fails when required member doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [68],
          [],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          'https://www.zoom.com',
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [1],
          [],
          [batman.userId],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('User', 68));
    });

    test('Edit Reimbursment Request fails when optionalMember doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamTypeId,
          [1],
          [68],
          designReview1.isOnline,
          designReview1.isInPerson,
          'https://www.zoom.com',
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          [1],
          [],
          [],
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('User', 68));
    });

    test('Edit Design Review fails when any confirmedMembers are in deniedMembers', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [1],
          [1],
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'confirmed members cannot be in denied members'));
    });

    test('Edit Design Review fails when any requiredMembers are in optionalMembers', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamTypeId,
          [1],
          [wonderwoman.userId, 1],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          [1],
          [],
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'required members cannot be in optional members'));
    });

    test('Edit Design Review fails when both online and in person are true', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [1],
          [],
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'design review cannot be both online and in person'));
    });

    test('Edit Design Review fails when the meeting is online and there is no zoomLink / no text', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [1],
          [],
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'zoom link is required for online design reviews'));
    });

    test('Edit Design Review fails when the meeting in person and there is no location', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
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
          [1],
          [],
          [],
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'location is required for in person design reviews'));
    });

    test('Edit Design Review succeeds when user is lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      await DesignReviewService.editDesignReview(
        aquaman,
        prismaDesignReview2.designReviewId,
        prismaDesignReview2.dateScheduled,
        prismaDesignReview2.teamTypeId,
        [1],
        [6],
        prismaDesignReview2.isOnline,
        prismaDesignReview2.isInPerson,
        prismaDesignReview2.zoomLink,
        prismaDesignReview2.location,
        prismaDesignReview2.docTemplateLink,
        prismaDesignReview2.status,
        [1],
        [],
        [],
        prismaDesignReview2.meetingTimes
      );

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      // kind bad way to test, but idk better for editting when there is no field for editedDate
      // unless I test everything?
      expect(prismaDesignReview2.isOnline).toEqual(true);
    });
  });
});
