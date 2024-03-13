import { designReview1, prismaDesignReview2 } from './test-data/design-reviews.test-data';
import { batman, theVisitor, wonderwoman } from './test-data/users.test-data';
import DesignReviewService from '../src/services/design-review.services';
import prisma from '../src/prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  DeletedException,
  NotFoundException
} from '../src/utils/errors.utils';
import { mechanicalTeamType } from './test-data/teams.test-data';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';

describe('Design Reviews', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllDesignReviews', () => {
    test('Get All Design Reviews works', async () => {
      vi.spyOn(prisma.design_Review, 'findMany').mockResolvedValue([]);

      const res = await DesignReviewService.getAllDesignReviews();

      expect(prisma.design_Review.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
    });
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

  describe('Create design review tests', () => {
    test('Create design review succeeds', async () => {
      vi.spyOn(prisma.teamType, 'findFirst').mockResolvedValue(mechanicalTeamType);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      vi.spyOn(prisma.design_Review, 'create').mockResolvedValue(designReview1);

      const res = await DesignReviewService.createDesignReview(
        batman,
        '2024-03-25',
        '1',
        [],
        [],
        '',
        true,
        false,
        '',
        'doc temp',
        1,
        [0, 1, 2, 3]
      );

      expect(res).toStrictEqual({
        ...designReview1
      });
    });

    test('Create design review fails guest permission', async () => {
      await expect(
        DesignReviewService.createDesignReview(
          theVisitor,
          '2024-03-25',
          '1',
          [],
          [],
          '',
          true,
          false,
          '',
          'doc temp',
          1,
          [0, 1, 2, 3]
        )
      ).rejects.toThrow(new AccessDeniedGuestException('create design review'));
    });

    test('Create design review team type not found', async () => {
      vi.spyOn(prisma.teamType, 'findFirst').mockResolvedValue(null);
      await expect(
        DesignReviewService.createDesignReview(
          batman,
          '2024-03-25',
          '15',
          [],
          [],
          '',
          true,
          false,
          '',
          'doc temp',
          1,
          [0, 1, 2, 3]
        )
      ).rejects.toThrow(new NotFoundException('Team Type', '15'));
    });

    test('Create design review wbs element not found', async () => {
      vi.spyOn(prisma.teamType, 'findFirst').mockResolvedValue(mechanicalTeamType);

      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);
      await expect(
        DesignReviewService.createDesignReview(
          batman,
          '2024-03-25',
          '1',
          [],
          [],
          '',
          true,
          false,
          '',
          'doc temp',
          245,
          [0, 1, 2, 3]
        )
      ).rejects.toThrow(new NotFoundException('WBS Element', 245));
    });
  });
});
