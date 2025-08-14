import { DesignReviewStatus } from 'shared';
import prisma from '../prisma/prisma';
import DesignReviewsService from '../services/design-reviews.services';
import { BenchSpec } from './bench-types';
import { Design_Review_Status } from '@prisma/client';

export const designReviewSpecs: BenchSpec<any>[] = [
  {
    name: 'design-reviews.getAllDesignReviews',
    tags: ['design-reviews', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await DesignReviewsService.getAllDesignReviews(organization);
    }
  },
  {
    name: 'design-reviews.getSingleDesignReview',
    tags: ['design-reviews', 'read'],
    async prepare(ctx) {
      const dr = await prisma.design_Review.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        select: { designReviewId: true }
      });
      if (!dr) return { skip: 'no design review found' };
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, designReviewId: dr.designReviewId, organization: ctx.organization } };
    },
    async run({ submitter, designReviewId, organization }) {
      await DesignReviewsService.getSingleDesignReview(submitter, designReviewId, organization);
    }
  },
  // Writes — create, edit, confirm, set-status, delete
  {
    name: 'design-reviews.createDesignReview',
    tags: ['design-reviews', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      const members = await prisma.user.findMany({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true },
        take: 5
      });
      if (members.length < 2) return { skip: 'not enough users' };
      return {
        inputs: {
          submitter,
          teamTypeId: teamType.teamTypeId,
          requiredMemberIds: [members[0].userId],
          optionalMemberIds: [members[1].userId],
          wbsNum,
          organization: ctx.organization
        }
      };
    },
    async run({ submitter, teamTypeId, requiredMemberIds, optionalMemberIds, wbsNum, organization }) {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await DesignReviewsService.createDesignReview(
        submitter,
        future,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        wbsNum,
        [1, 2],
        organization
      );
    }
  },
  {
    name: 'design-reviews.editDesignReview',
    tags: ['design-reviews', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      const members = await prisma.user.findMany({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true },
        take: 5
      });
      if (members.length < 3) return { skip: 'not enough users' };
      return {
        inputs: {
          submitter,
          teamTypeId: teamType.teamTypeId,
          requiredMemberIds: [members[0].userId],
          optionalMemberIds: [members[1].userId],
          attendees: [members[2].userId],
          wbsNum,
          organization: ctx.organization
        }
      };
    },
    async run({ submitter, teamTypeId, requiredMemberIds, optionalMemberIds, attendees, wbsNum, organization }) {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await DesignReviewsService.createDesignReview(
        submitter,
        future,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        wbsNum,
        [2, 3],
        organization
      );
      const dateScheduled = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await DesignReviewsService.editDesignReview(
        submitter,
        created.designReviewId,
        dateScheduled,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        false,
        true,
        null,
        'Room 100',
        'https://docs.example.com/template',
        Design_Review_Status.SCHEDULED,
        attendees,
        [3, 4],
        organization
      );
    }
  },
  {
    name: 'design-reviews.markUserConfirmed',
    tags: ['design-reviews', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const confirmer = await prisma.user.findUnique({
        where: { userId: ctx.memberUser.userId },
        include: { userSettings: true }
      });
      if (!submitter || !confirmer) return { skip: 'missing users' };
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { submitter, confirmer, teamTypeId: teamType.teamTypeId, wbsNum, organization: ctx.organization } };
    },
    async run({ submitter, confirmer, teamTypeId, wbsNum, organization }) {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await DesignReviewsService.createDesignReview(
        submitter,
        future,
        teamTypeId,
        [confirmer.userId],
        [],
        wbsNum,
        [1, 2],
        organization
      );
      await DesignReviewsService.markUserConfirmed(
        created.designReviewId,
        [{ availability: [1, 3, 5], dateSet: new Date() }],
        confirmer,
        organization
      );
    }
  },
  {
    name: 'design-reviews.setStatus',
    tags: ['design-reviews', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { submitter, teamTypeId: teamType.teamTypeId, wbsNum, organization: ctx.organization } };
    },
    async run({ submitter, teamTypeId, wbsNum, organization }) {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await DesignReviewsService.createDesignReview(
        submitter,
        future,
        teamTypeId,
        [],
        [],
        wbsNum,
        [1, 2],
        organization
      );
      await DesignReviewsService.setStatus(submitter, created.designReviewId, DesignReviewStatus.CONFIRMED, organization);
    }
  },
  {
    name: 'design-reviews.deleteDesignReview',
    tags: ['design-reviews', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { submitter, teamTypeId: teamType.teamTypeId, wbsNum, organization: ctx.organization } };
    },
    async run({ submitter, teamTypeId, wbsNum, organization }) {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await DesignReviewsService.createDesignReview(
        submitter,
        future,
        teamTypeId,
        [],
        [],
        wbsNum,
        [1, 2],
        organization
      );
      await DesignReviewsService.deleteDesignReview(submitter, created.designReviewId, organization);
    }
  }
];
