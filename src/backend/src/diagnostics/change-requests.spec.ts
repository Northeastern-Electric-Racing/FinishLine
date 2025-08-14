import prisma from '../prisma/prisma';
import ChangeRequestsService from '../services/change-requests.services';
import { BenchSpec } from './bench-types';
import { CR_Type, Scope_CR_Why_Type } from '@prisma/client';

export const changeRequestSpecs: BenchSpec<any>[] = [
  {
    name: 'change-requests.getAllChangeRequests',
    tags: ['change-requests', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await ChangeRequestsService.getAllChangeRequests(organization);
    }
  },
  {
    name: 'change-requests.getChangeRequestByID',
    tags: ['change-requests', 'read'],
    async prepare(ctx) {
      const cr = await prisma.change_Request.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null },
        select: { crId: true }
      });
      if (!cr) return { skip: 'no change request found' };
      return { inputs: { crId: cr.crId, organization: ctx.organization } };
    },
    async run({ crId, organization }) {
      await ChangeRequestsService.getChangeRequestByID(crId, organization);
    }
  },
  {
    name: 'change-requests.getToReviewChangeRequests',
    tags: ['change-requests', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await ChangeRequestsService.getToReviewChangeRequests(user, organization);
    }
  },
  {
    name: 'change-requests.getUnreviewedChangeRequests',
    tags: ['change-requests', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, wbsnum: undefined, organization: ctx.organization } };
    },
    async run({ user, wbsnum, organization }) {
      await ChangeRequestsService.getUnreviewedChangeRequests(user, wbsnum, organization);
    }
  },
  {
    name: 'change-requests.getApprovedChangeRequests',
    tags: ['change-requests', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, wbsnum: undefined, organization: ctx.organization } };
    },
    async run({ user, wbsnum, organization }) {
      await ChangeRequestsService.getApprovedChangeRequests(user, wbsnum, organization);
    }
  },
  // Writes: create, add proposed solution, review, request review, delete, activation, budget
  {
    name: 'change-requests.createStandardChangeRequest',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      const wbs = await prisma.wBS_Element.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          projectNumber: 0,
          workPackageNumber: 0
        },
        orderBy: { dateCreated: 'asc' }
      });
      if (!wbs) return { skip: 'no suitable WBS element' };
      return {
        inputs: {
          submitter,
          organization: ctx.organization,
          carNumber: wbs.carNumber,
          projectNumber: wbs.projectNumber,
          workPackageNumber: wbs.workPackageNumber
        }
      };
    },
    async run({ submitter, organization, carNumber, projectNumber, workPackageNumber }) {
      await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        carNumber,
        projectNumber,
        workPackageNumber,
        CR_Type.OTHER,
        'bench-what',
        [{ type: Scope_CR_Why_Type.DESIGN, explain: 'bench-why' }],
        [
          {
            description: 'bench ps',
            scopeImpact: 'small',
            timelineImpact: 0,
            budgetImpact: 0
          }
        ],
        organization,
        null,
        null
      );
    }
  },
  {
    name: 'change-requests.addProposedSolution',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      const wbs = await prisma.wBS_Element.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          projectNumber: 0,
          workPackageNumber: 0
        },
        orderBy: { dateCreated: 'desc' }
      });
      if (!wbs) return { skip: 'no WBS element' };
      return { inputs: { submitter, wbs, organization: ctx.organization } };
    },
    async run({ submitter, wbs, organization }) {
      const cr = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        wbs.carNumber,
        wbs.projectNumber,
        wbs.workPackageNumber,
        CR_Type.OTHER,
        'bench-add-ps',
        [{ type: Scope_CR_Why_Type.SCHOOL, explain: 'why' }],
        [
          {
            description: 'initial',
            scopeImpact: 'none',
            timelineImpact: 0,
            budgetImpact: 0
          }
        ],
        organization,
        null,
        null
      );
      await ChangeRequestsService.addProposedSolution(submitter, cr.crId, 5, 'bench extra PS', 1, 'minor', organization);
    }
  },
  {
    name: 'change-requests.reviewChangeRequest',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const reviewerRole = await prisma.role.findFirst({
        where: { organizationId: ctx.organization.organizationId, roleType: 'HEAD' },
        select: { userId: true }
      });
      if (!submitter || !reviewerRole) return { skip: 'missing submitter or reviewer' };
      if (reviewerRole.userId === submitter.userId) return { skip: 'reviewer equals submitter' };
      const reviewer = await prisma.user.findUnique({ where: { userId: reviewerRole.userId } });
      if (!reviewer) return { skip: 'no reviewer user' };
      const wbs = await prisma.wBS_Element.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          projectNumber: 0,
          workPackageNumber: 0
        },
        orderBy: { dateCreated: 'desc' }
      });
      if (!wbs) return { skip: 'no WBS element' };
      return { inputs: { reviewer, submitter, wbs, organization: ctx.organization } };
    },
    async run({ reviewer, submitter, wbs, organization }) {
      const created = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        wbs.carNumber,
        wbs.projectNumber,
        wbs.workPackageNumber,
        CR_Type.OTHER,
        'bench-review-what',
        [{ type: Scope_CR_Why_Type.DESIGN, explain: 'why' }],
        [
          { description: 'ps1', scopeImpact: 'scope', timelineImpact: 0, budgetImpact: 0 },
          { description: 'ps2', scopeImpact: 'scope2', timelineImpact: 1, budgetImpact: 10 }
        ],
        organization,
        null,
        null
      );
      const ps = await prisma.proposed_Solution.findFirst({
        where: { scopeChangeRequest: { changeRequestId: created.crId } },
        select: { proposedSolutionId: true }
      });
      if (!ps) return;
      await ChangeRequestsService.reviewChangeRequest(
        reviewer,
        created.crId,
        'bench review',
        true,
        organization,
        ps.proposedSolutionId
      );
    }
  },
  {
    name: 'change-requests.requestCRReview',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      const reviewer = await prisma.user.findFirst({
        where: {
          roles: { some: { organizationId: ctx.organization.organizationId, roleType: 'HEAD' } },
          userSettings: { is: { slackId: { not: '' } } }
        },
        select: { userId: true }
      });
      if (!reviewer) return { skip: 'no suitable reviewer' };
      const wbs = await prisma.wBS_Element.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          projectNumber: 0,
          workPackageNumber: 0
        }
      });
      if (!wbs) return { skip: 'no WBS element' };
      return { inputs: { submitter, reviewerId: reviewer.userId, wbs, organization: ctx.organization } };
    },
    async run({ submitter, reviewerId, wbs, organization }) {
      const cr = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        wbs.carNumber,
        wbs.projectNumber,
        wbs.workPackageNumber,
        CR_Type.OTHER,
        'bench-request-review',
        [{ type: Scope_CR_Why_Type.DESIGN, explain: 'why' }],
        [{ description: 'ps', scopeImpact: 'none', timelineImpact: 0, budgetImpact: 0 }],
        organization,
        null,
        null
      );
      await ChangeRequestsService.requestCRReview(submitter, [reviewerId], cr.crId, organization);
    }
  },
  {
    name: 'change-requests.deleteChangeRequest',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!admin || !submitter) return { skip: 'missing admin or submitter' };
      const wbs = await prisma.wBS_Element.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          projectNumber: 0,
          workPackageNumber: 0
        }
      });
      if (!wbs) return { skip: 'no WBS element' };
      return { inputs: { admin, submitter, wbs, organization: ctx.organization } };
    },
    async run({ admin, submitter, wbs, organization }) {
      const cr = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        wbs.carNumber,
        wbs.projectNumber,
        wbs.workPackageNumber,
        CR_Type.OTHER,
        'bench-delete',
        [{ type: Scope_CR_Why_Type.DESIGN, explain: 'why' }],
        [{ description: 'ps', scopeImpact: 'none', timelineImpact: 0, budgetImpact: 0 }],
        organization,
        null,
        null
      );
      await ChangeRequestsService.deleteChangeRequest(admin, cr.crId, organization);
    }
  },
  {
    name: 'change-requests.createActivationChangeRequest',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      const wp = await prisma.work_Package.findFirst({
        where: { project: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } } },
        include: { wbsElement: true }
      });
      if (!wp) return { skip: 'no work package found' };
      const lead = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      const manager = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      if (!lead || !manager) return { skip: 'no lead/manager' };
      return {
        inputs: {
          submitter,
          organization: ctx.organization,
          carNumber: wp.wbsElement.carNumber,
          projectNumber: wp.wbsElement.projectNumber,
          workPackageNumber: wp.wbsElement.workPackageNumber,
          leadId: lead.userId,
          managerId: manager.userId,
          startDate: new Date()
        }
      };
    },
    async run({ submitter, organization, carNumber, projectNumber, workPackageNumber, leadId, managerId, startDate }) {
      await ChangeRequestsService.createActivationChangeRequest(
        submitter,
        carNumber,
        projectNumber,
        workPackageNumber,
        CR_Type.ACTIVATION,
        leadId,
        managerId,
        startDate,
        true,
        organization
      );
    }
  },
  {
    name: 'change-requests.createBudgetChangeRequest',
    tags: ['change-requests', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      const accountCode = await prisma.account_Code.findFirst({
        where: {
          organizationId: ctx.organization.organizationId,
          dateDeleted: null,
          changeRequests: { none: { dateReviewed: null, dateDeleted: null } }
        },
        select: { accountCodeId: true }
      });
      if (!accountCode) return { skip: 'no account code' };
      const reviewerRole = await prisma.role.findFirst({
        where: { organizationId: ctx.organization.organizationId, roleType: 'HEAD' },
        select: { userId: true }
      });
      if (!reviewerRole || reviewerRole.userId === submitter.userId) return { skip: 'no suitable reviewer' };
      const reviewer = await prisma.user.findUnique({ where: { userId: reviewerRole.userId } });
      if (!reviewer) return { skip: 'no reviewer user' };
      return {
        inputs: {
          submitter,
          reviewer,
          organization: ctx.organization,
          accountCodeId: accountCode.accountCodeId
        }
      };
    },
    async run({ submitter, reviewer, organization, accountCodeId }) {
      const cr = await ChangeRequestsService.createBudgetChangeRequest(
        submitter,
        CR_Type.BUDGET,
        1234,
        organization,
        undefined,
        accountCodeId
      );
      await ChangeRequestsService.reviewChangeRequest(reviewer, cr.crId, 'bench', true, organization, null);
    }
  }
];
