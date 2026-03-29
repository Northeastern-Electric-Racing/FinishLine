import { CR_Type, Organization, Scope_CR_Why_Type, User, WBS_Element_Status } from '@prisma/client';
import { createTestCar, createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils.js';
import ChangeRequestsService from '../../src/services/change-requests.services.js';
import {
  supermanAdmin,
  aquamanLeadership,
  greenlanternHead,
  flashAdmin,
  robinMember
} from '../test-data/users.test-data.js';
import { ProjectProposedChangesCreateArgs, WorkPackageProposedChangesCreateArgs } from 'shared';
import prisma from '../../src/prisma/prisma.js';
import { AccessDeniedException } from '../../src/utils/errors.utils.js';

describe('Change Request Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    await prisma.wBS_Element.create({
      data: {
        carNumber: 12,
        projectNumber: 13,
        workPackageNumber: 14,
        name: 'test wbs',
        organizationId: orgId,
        status: WBS_Element_Status.INACTIVE
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Change Request', () => {
    it('create change request on an inactive project - project changes', async () => {
      const projPropChanges: ProjectProposedChangesCreateArgs = {
        name: 'Project name changes',
        descriptionBullets: [],
        links: [],
        budget: 10,
        summary: 'Summary',
        teamIds: [],
        workPackageProposedChanges: []
      };

      const cr = await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        projPropChanges,
        null
      );

      expect(cr.submitter.userId).toEqual(user.userId);
      expect(cr.wbsNum?.carNumber).toEqual(12);
      expect(cr.wbsNum?.projectNumber).toEqual(13);
      expect(cr.wbsNum?.workPackageNumber).toEqual(14);

      expect(cr.type).toEqual(CR_Type.DEFINITION_CHANGE);
      expect(cr.what).toEqual('What');
      expect(cr.proposedSolutions).toHaveLength(0);

      expect(cr.wbsNum).toBeDefined();
      expect(cr.wbsNum).not.toBeNull();

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.INACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request does not make active project inactive - project changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.ACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.ACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request does not make active project inactive - work package changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.ACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      const cr = await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });
      expect(cr.submitter.userId).toEqual(user.userId);
      expect(cr.wbsNum?.carNumber).toEqual(12);
      expect(cr.wbsNum?.projectNumber).toEqual(13);
      expect(cr.wbsNum?.workPackageNumber).toEqual(14);

      expect(cr.type).toEqual(CR_Type.DEFINITION_CHANGE);
      expect(cr.what).toEqual('What');
      expect(cr.proposedSolutions).toHaveLength(0);

      expect(cr.wbsNum).toBeDefined();
      expect(cr.wbsNum).not.toBeNull();

      expect(wbsElement?.status).toEqual(WBS_Element_Status.ACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request on an inactive project - work package changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.INACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.INACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
  });

  describe('Review Change Request with Requested Reviewers', () => {
    let submitterUser: User;
    let leadershipUser1: User;
    let leadershipUser2: User;
    let nonRequestedLeadership: User;
    let memberUser: User;
    let changeRequestId: string;

    beforeEach(async () => {
      // Use the existing user from the main beforeEach
      submitterUser = user;

      // Create users with User_Settings that include slackId (needed for requestCRReview)
      leadershipUser1 = await createTestUser(aquamanLeadership, orgId, {
        id: 'aquaman-settings',
        userId: '',
        defaultTheme: 'DARK' as any,
        slackId: 'slack-aquaman'
      });

      leadershipUser2 = await createTestUser(greenlanternHead, orgId, {
        id: 'greenlantern-settings',
        userId: '',
        defaultTheme: 'DARK' as any,
        slackId: 'slack-greenlantern'
      });

      nonRequestedLeadership = await createTestUser(flashAdmin, orgId, {
        id: 'flash-settings',
        userId: '',
        defaultTheme: 'DARK' as any,
        slackId: 'slack-flash'
      });

      memberUser = await createTestUser(robinMember, orgId);

      // Create a simple change request with a proposed solution
      const cr = await ChangeRequestsService.createStandardChangeRequest(
        submitterUser,
        12,
        13,
        14,
        CR_Type.ISSUE,
        'What is being changed',
        [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'Why it is being changed' }],
        [
          {
            description: 'Proposed solution',
            scopeImpact: 'Low impact',
            timelineImpact: 0,
            budgetImpact: 0
          }
        ],
        organization,
        null,
        null
      );

      changeRequestId = cr.crId;
    });

    it('allows any leadership to review when no reviewers are requested', async () => {
      const reviewResult = await ChangeRequestsService.reviewChangeRequest(
        nonRequestedLeadership,
        changeRequestId,
        'Looks good',
        false,
        organization,
        null
      );

      expect(reviewResult).toBe(changeRequestId);

      const updatedCR = await prisma.change_Request.findUnique({
        where: { crId: changeRequestId }
      });

      expect(updatedCR?.reviewerId).toBe(nonRequestedLeadership.userId);
      expect(updatedCR?.accepted).toBe(false);
    });

    it('allows requested reviewer to review when reviewers are requested', async () => {
      await ChangeRequestsService.requestCRReview(
        submitterUser,
        [leadershipUser1.userId, leadershipUser2.userId],
        changeRequestId,
        organization
      );

      const reviewResult = await ChangeRequestsService.reviewChangeRequest(
        leadershipUser1,
        changeRequestId,
        'Approved',
        false,
        organization,
        null
      );

      expect(reviewResult).toBe(changeRequestId);

      const updatedCR = await prisma.change_Request.findUnique({
        where: { crId: changeRequestId }
      });

      expect(updatedCR?.reviewerId).toBe(leadershipUser1.userId);
      expect(updatedCR?.accepted).toBe(false);
    });

    it('rejects non-requested leadership when reviewers are requested', async () => {
      await ChangeRequestsService.requestCRReview(
        submitterUser,
        [leadershipUser1.userId, leadershipUser2.userId],
        changeRequestId,
        organization
      );

      await expect(
        ChangeRequestsService.reviewChangeRequest(
          nonRequestedLeadership,
          changeRequestId,
          'I want to review this',
          true,
          organization,
          null
        )
      ).rejects.toThrow(AccessDeniedException);

      await expect(
        ChangeRequestsService.reviewChangeRequest(
          nonRequestedLeadership,
          changeRequestId,
          'I want to review this',
          true,
          organization,
          null
        )
      ).rejects.toThrow('Only requested reviewers can review this change request!');
    });

    it('allows second requested reviewer to review when reviewers are requested', async () => {
      await ChangeRequestsService.requestCRReview(
        submitterUser,
        [leadershipUser1.userId, leadershipUser2.userId],
        changeRequestId,
        organization
      );

      const reviewResult = await ChangeRequestsService.reviewChangeRequest(
        leadershipUser2,
        changeRequestId,
        'Approved by second reviewer',
        false,
        organization,
        null
      );

      expect(reviewResult).toBe(changeRequestId);

      const updatedCR = await prisma.change_Request.findUnique({
        where: { crId: changeRequestId }
      });

      expect(updatedCR?.reviewerId).toBe(leadershipUser2.userId);
      expect(updatedCR?.accepted).toBe(false);
    });

    it('rejects member user from being requested as a reviewer', async () => {
      // requestCRReview should fail when trying to add a non-leadership user
      await expect(
        ChangeRequestsService.requestCRReview(
          submitterUser,
          [leadershipUser1.userId, memberUser.userId],
          changeRequestId,
          organization
        )
      ).rejects.toThrow(AccessDeniedException);

      await expect(
        ChangeRequestsService.requestCRReview(
          submitterUser,
          [leadershipUser1.userId, memberUser.userId],
          changeRequestId,
          organization
        )
      ).rejects.toThrow('The following user(s) are not leadership: Dick Grayson');
    });

    it('allows rejection by non-requested leadership when reviewers are requested', async () => {
      await ChangeRequestsService.requestCRReview(submitterUser, [leadershipUser1.userId], changeRequestId, organization);

      await expect(
        ChangeRequestsService.reviewChangeRequest(
          nonRequestedLeadership,
          changeRequestId,
          'Rejecting this',
          false,
          organization,
          null
        )
      ).rejects.toThrow(AccessDeniedException);
    });
  });

  describe('global car filter', () => {
    let carAId: string;
    let carBId: string;
    let otherUser: User;

    const solutionArgs = [{ description: 'Solution', scopeImpact: 'Low', timelineImpact: 0, budgetImpact: 0 }];

    // projPropChanges makes a CR a scope CR
    const projPropChanges = {
      name: 'Updated project',
      descriptionBullets: [],
      links: [],
      budget: 100,
      summary: 'Summary',
      teamIds: [],
      workPackageProposedChanges: []
    };

    beforeEach(async () => {
      // The reviewing user (user) cannot be the submitter of scope CRs they review so otherUser is used  .
      otherUser = await createTestUser(aquamanLeadership, orgId);

      const carA = await createTestCar(orgId, user.userId, 0);
      carAId = carA.carId;
      const carB = await createTestCar(orgId, user.userId, 1);
      carBId = carB.carId;

      // Project under car A: WBS 0.1.0, project.carId = carAId, lead/manager = user
      await createTestProject(user, orgId, undefined, carAId, 1);
      // Project under car B: WBS 0.2.0, project.carId = carBId, lead/manager = user
      await createTestProject(user, orgId, undefined, carBId, 2);
    });

    describe('getAllChangeRequests', () => {
      it('respects the global car filter and returns only CRs for the selected car', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        const results = await ChangeRequestsService.getAllChangeRequests(organization, carAId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      });

      it('returns all CRs when no car is selected', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        const results = await ChangeRequestsService.getAllChangeRequests(organization);

        expect(results).toHaveLength(2);
      });
    });

    describe('getToReviewChangeRequests', () => {
      it('respects the global car filter and returns only to-review CRs for the selected car', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          otherUser,
          0,
          1,
          0,
          CR_Type.DEFINITION_CHANGE,
          'Scope CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          [],
          organization,
          projPropChanges,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          otherUser,
          0,
          2,
          0,
          CR_Type.DEFINITION_CHANGE,
          'Scope CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          [],
          organization,
          projPropChanges,
          null
        );

        const results = await ChangeRequestsService.getToReviewChangeRequests(user, organization, carAId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      });

      it('returns all to-review CRs when no car is selected', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          otherUser,
          0,
          1,
          0,
          CR_Type.DEFINITION_CHANGE,
          'Scope CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          [],
          organization,
          projPropChanges,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          otherUser,
          0,
          2,
          0,
          CR_Type.DEFINITION_CHANGE,
          'Scope CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          [],
          organization,
          projPropChanges,
          null
        );

        const results = await ChangeRequestsService.getToReviewChangeRequests(user, organization);

        expect(results).toHaveLength(2);
      });
    });

    describe('getUnreviewedChangeRequests', () => {
      it('respects the global car filter and returns only unreviewed CRs for the selected car', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'Unreviewed CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'Unreviewed CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        const results = await ChangeRequestsService.getUnreviewedChangeRequests(user, undefined, organization, carAId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      });

      it('ignores the global car filter when a wbsNum is provided and returns CRs matching the wbsNum', async () => {
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'Unreviewed CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'Unreviewed CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        // wbsNum scopes to car A's project; carId points to car B - car filter should be ignored
        const wbsNum = { carNumber: 0, projectNumber: 1, workPackageNumber: 0 };
        const results = await ChangeRequestsService.getUnreviewedChangeRequests(user, wbsNum, organization, carBId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      });
    });

    describe('getApprovedChangeRequests', () => {
      it('respects the global car filter and returns only recent CRs for the selected car', async () => {
        const crA = await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'Recent CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        const crB = await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'Recent CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        // getApprovedChangeRequests requires dateReviewed >= fiveDaysAgo - review both CRs to satisfy this
        await ChangeRequestsService.reviewChangeRequest(otherUser, crA.crId, '', false, organization, null);
        await ChangeRequestsService.reviewChangeRequest(otherUser, crB.crId, '', false, organization, null);

        const results = await ChangeRequestsService.getApprovedChangeRequests(user, undefined, organization, carAId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      }, 15000);

      it('ignores the global car filter when a wbsNum is provided and returns CRs matching the wbsNum', async () => {
        const crA = await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          1,
          0,
          CR_Type.ISSUE,
          'Recent CR on car A',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );
        const crB = await ChangeRequestsService.createStandardChangeRequest(
          user,
          0,
          2,
          0,
          CR_Type.ISSUE,
          'Recent CR on car B',
          [{ type: Scope_CR_Why_Type.COMPETITION, explain: 'reason' }],
          solutionArgs,
          organization,
          null,
          null
        );

        // getApprovedChangeRequests requires dateReviewed >= fiveDaysAgo - review both CRs to satisfy this
        await ChangeRequestsService.reviewChangeRequest(otherUser, crA.crId, '', false, organization, null);
        await ChangeRequestsService.reviewChangeRequest(otherUser, crB.crId, '', false, organization, null);

        // wbsNum scopes to car A's project; carId points to car B - car filter should be ignored
        const wbsNum = { carNumber: 0, projectNumber: 1, workPackageNumber: 0 };
        const results = await ChangeRequestsService.getApprovedChangeRequests(user, wbsNum, organization, carBId);

        expect(results).toHaveLength(1);
        expect(results[0].wbsNum?.projectNumber).toBe(1); // car A's project
      }, 15000);
    });
  });
});
