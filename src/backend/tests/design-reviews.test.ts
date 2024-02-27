import { designReview1, prismaDesignReview2 } from './test-data/design-reviews.test-data.ts';
import { batman, wonderwoman, aquaman } from './test-data/users.test-data';
import DesignReviewService from '../src/services/design-review.services.ts';
import prisma from '../src/prisma/prisma';
import { AccessDeniedMemberException, DeletedException, NotFoundException, HttpException } from '../src/utils/errors.utils';

describe('Design Reviews', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Delete Design Review Tests', () => {
    test('Delete Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() => DesignReviewService.deleteDesignReview(batman, designReview1.designReviewId)).rejects.toThrow(
        new NotFoundException('Design Review', designReview1.designReviewId)
      );
    });
    test('Delete Design Review fails when user is not an admin nor the user who created the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() => DesignReviewService.deleteDesignReview(wonderwoman, designReview1.designReviewId)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete design reviews')
      );
    });
    test('Delete Design Review fails when design review is already deleted', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue({ ...designReview1, dateDeleted: new Date() });
      await expect(() => DesignReviewService.deleteDesignReview(batman, designReview1.designReviewId)).rejects.toThrow(
        new DeletedException('Design Review', designReview1.designReviewId)
      );
    });
    test('Delete Design Review succeeds when user is admin', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewService.deleteDesignReview(batman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });

    test('Delete Design Review succeeds when user is the creator of the design review', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateDeleted).toBeNull();

      await DesignReviewService.deleteDesignReview(wonderwoman, prismaDesignReview2.designReviewId);

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      expect(prismaDesignReview2.dateDeleted).toBeDefined();
    });
  });

  describe('Edit Design Review Tests', () => {
    test('Edit Reimbursment Request fails when ID does not exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamType,
          designReview1.requiredMembers,
          designReview1.optionaldMembers,
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          designReview1.confirmedMembers,
          designReview1.deniedMembers,
          designReview1.attendees,
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
          designReview1.teamType,
          designReview1.requiredMembers,
          designReview1.optionaldMembers,
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          designReview1.confirmedMembers,
          designReview1.deniedMembers,
          designReview1.attendees,
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
          designReview1.teamType,
          designReview1.requiredMembers,
          designReview1.optionaldMembers,
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          designReview1.confirmedMembers,
          designReview1.deniedMembers,
          designReview1.attendees,
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new AccessDeniedMemberException('edit design reviews'));
    });

    test('Edit Reimbursment Request fails when requiredmember doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamType,
          [68],
          designReview1.optionaldMembers,
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          designReview1.confirmedMembers,
          designReview1.deniedMembers,
          designReview1.attendees,
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('Design Review', designReview1.designReviewId));
    });

    test('Edit Reimbursment Request fails when optionalMember doesnt exist', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          designReview1.designReviewId,
          designReview1.dateScheduled,
          designReview1.teamType,
          designReview1.requiredMembers,
          [68],
          designReview1.isOnline,
          designReview1.isInPerson,
          designReview1.zoomLink,
          prismaDesignReview2.location,
          designReview1.docTemplateLink,
          designReview1.status,
          designReview1.confirmedMembers,
          designReview1.deniedMembers,
          designReview1.attendees,
          designReview1.meetingTimes
        )
      ).rejects.toThrow(new NotFoundException('Design Review', designReview1.designReviewId));
    });

    test('Edit Design Review fails when any confirmedMembers are in deniedMembers', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(designReview1);
      await expect(() =>
        DesignReviewService.editDesignReview(
          batman,
          prismaDesignReview2.designReviewId,
          prismaDesignReview2.dateScheduled,
          prismaDesignReview2.teamType,
          prismaDesignReview2.requiredMembers,
          prismaDesignReview2.optionaldMembers,
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          prismaDesignReview2.confirmedMembers,
          [wonderwoman.userId],
          prismaDesignReview2.attendees,
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
          prismaDesignReview2.teamType,
          prismaDesignReview2.requiredMembers,
          [wonderwoman.userId],
          prismaDesignReview2.isOnline,
          prismaDesignReview2.isInPerson,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          prismaDesignReview2.confirmedMembers,
          prismaDesignReview2.deniedMembers,
          prismaDesignReview2.attendees,
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
          prismaDesignReview2.teamType,
          prismaDesignReview2.requiredMembers,
          prismaDesignReview2.optionaldMembers,
          true,
          true,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          prismaDesignReview2.confirmedMembers,
          prismaDesignReview2.deniedMembers,
          prismaDesignReview2.attendees,
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
          prismaDesignReview2.teamType,
          prismaDesignReview2.requiredMembers,
          prismaDesignReview2.optionaldMembers,
          true,
          false,
          '',
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          prismaDesignReview2.confirmedMembers,
          prismaDesignReview2.deniedMembers,
          prismaDesignReview2.attendees,
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
          prismaDesignReview2.teamType,
          prismaDesignReview2.requiredMembers,
          prismaDesignReview2.optionaldMembers,
          false,
          true,
          prismaDesignReview2.zoomLink,
          prismaDesignReview2.location,
          prismaDesignReview2.docTemplateLink,
          prismaDesignReview2.status,
          prismaDesignReview2.confirmedMembers,
          prismaDesignReview2.deniedMembers,
          prismaDesignReview2.attendees,
          prismaDesignReview2.meetingTimes
        )
      ).rejects.toThrow(new HttpException(400, 'location is required for in person design reviews'));
    });

    test('Edit Design Review succeeds when user is lead or above', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateEditd).toBeNull();

      await DesignReviewService.editDesignReview(
        aquaman,
        prismaDesignReview2.DesignReviewId,
        prismaDesignReview2.DateScheduled,
        prismaDesignReview2.TeamType,
        prismaDesignReview2.RequiredMembers,
        prismaDesignReview2.OptionaldMembers,
        prismaDesignReview2.isOnline,
        prismaDesignReview2.isInPerson,
        prismaDesignReview2.zoomLink,
        prismaDesignReview2.location,
        prismaDesignReview2.DocTemplateLink,
        prismaDesignReview2.Status,
        prismaDesignReview2.ConfirmedMembers,
        prismaDesignReview2.DeniedMembers,
        prismaDesignReview2.Attendees,
        prismaDesignReview2.MeetingTimes
      );

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      // kind bad way to test, but idk better for editting when there is no field for editedDate
      // unless I test everything?
      expect(prismaDesignReview2.isOnline).toEqual(true);
    });

    test('Edit Design Review succeeds all fields meet above requirements', async () => {
      vi.spyOn(prisma.design_Review, 'findUnique').mockResolvedValue(prismaDesignReview2);
      vi.spyOn(prisma.design_Review, 'update').mockResolvedValue(prismaDesignReview2);

      expect(prismaDesignReview2.dateEditd).toBeNull();

      await DesignReviewService.editDesignReview(
        batman,
        prismaDesignReview2.DesignReviewId,
        prismaDesignReview2.DateScheduled,
        prismaDesignReview2.TeamType,
        prismaDesignReview2.RequiredMembers,
        prismaDesignReview2.OptionaldMembers,
        false,
        true,
        prismaDesignReview2.ZoomLink,
        prismaDesignReview2.Location,
        prismaDesignReview2.DocTemplateLink,
        prismaDesignReview2.Status,
        prismaDesignReview2.ConfirmedMembers,
        prismaDesignReview2.DeniedMembers,
        prismaDesignReview2.Attendees,
        prismaDesignReview2.MeetingTimes
      );

      expect(prisma.design_Review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.design_Review.update).toHaveBeenCalledTimes(1);
      // kind bad way to test, but idk better for editting when there is no field for editedDate
      expect(prismaDesignReview2.isOnline).toEqual(false);
    });
  });
});
