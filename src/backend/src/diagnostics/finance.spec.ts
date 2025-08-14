import prisma from '../prisma/prisma';
import FinanceServices from '../services/finance.services';
import { BenchSpec } from './bench-types';

export const financeSpecs: BenchSpec<any>[] = [
  {
    name: 'finance.getAllSponsors',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await FinanceServices.getAllSponsors(organization);
    }
  },
  {
    name: 'finance.getAllSponsorTiers',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await FinanceServices.getAllSponsorTiers(organization);
    }
  },
  {
    name: 'finance.getSponsorTasks',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const sponsor = await prisma.sponsor.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
      });
      if (!sponsor) return { skip: 'no sponsor found' };
      return { inputs: { sponsorId: sponsor.sponsorId, organizationId: ctx.organization.organizationId } };
    },
    async run({ sponsorId, organizationId }) {
      await FinanceServices.getSponsorTasks(sponsorId, organizationId);
    }
  },
  {
    name: 'finance.getSpendingBarCategoryData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await FinanceServices.getSpendingBarCategoryData(organization);
    }
  },
  {
    name: 'finance.getAllSpendingBarData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization, startDate: undefined, endDate: undefined } };
    },
    async run({ organization, startDate, endDate }) {
      await FinanceServices.getAllSpendingBarData(organization, startDate, endDate);
    }
  },
  {
    name: 'finance.getSpendingBarTeamData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!team) return { skip: 'no team' };
      return { inputs: { organization: ctx.organization, teamId: team.teamId } };
    },
    async run({ organization, teamId }) {
      await FinanceServices.getSpendingBarTeamData(organization, teamId);
    }
  },
  {
    name: 'finance.getSpendingBarTeamTypeData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      return { inputs: { organization: ctx.organization, teamTypeId: teamType.teamTypeId } };
    },
    async run({ organization, teamTypeId }) {
      await FinanceServices.getSpendingBarTeamTypeData(organization, teamTypeId);
    }
  },
  {
    name: 'finance.getReimbursementRequestProjectData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const project = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        select: { projectId: true }
      });
      if (!project) return { skip: 'no project' };
      return { inputs: { organization: ctx.organization, projectId: project.projectId } };
    },
    async run({ organization, projectId }) {
      await FinanceServices.getReimbursementRequestProjectData(organization, projectId);
    }
  },
  {
    name: 'finance.getReimbursementRequestTeamData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!team) return { skip: 'no team' };
      return { inputs: { organization: ctx.organization, teamId: team.teamId } };
    },
    async run({ organization, teamId }) {
      await FinanceServices.getReimbursementRequestTeamData(organization, teamId);
    }
  },
  {
    name: 'finance.getReimbursementRequestTeamTypeData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const teamType = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!teamType) return { skip: 'no team type' };
      return { inputs: { organization: ctx.organization, teamTypeId: teamType.teamTypeId } };
    },
    async run({ organization, teamTypeId }) {
      await FinanceServices.getReimbursementRequestTeamTypeData(organization, teamTypeId);
    }
  },
  {
    name: 'finance.getReimbursementRequestCategoryData',
    tags: ['finance', 'read'],
    async prepare(ctx) {
      const category = await prisma.reimbursement_Product_Other_Reason.findFirst({
        where: { dateDeleted: null, indexCode: { organizationId: ctx.organization.organizationId } },
        select: { otherReimbursementProductReasonId: true }
      });
      if (!category) return { skip: 'no category' };
      return {
        inputs: { organization: ctx.organization, otherReasonId: category.otherReimbursementProductReasonId }
      };
    },
    async run({ organization, otherReasonId }) {
      await FinanceServices.getReimbursementRequestCategoryData(otherReasonId, organization);
    }
  },
  // Writes — sponsor tier, sponsor, sponsor task lifecycle
  {
    name: 'finance.createSponsorTier',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      return { inputs: { submitter, organization: ctx.organization, colorHexCode: '#FFAA00' } };
    },
    async run({ submitter, organization, colorHexCode }) {
      const name = `Bench Tier ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await FinanceServices.createSponsorTier(submitter, name, organization, colorHexCode);
    }
  },
  {
    name: 'finance.createSponsor',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      let tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      if (!tier) {
        tier = await FinanceServices.createSponsorTier(
          submitter,
          `Auto Tier ${Math.random().toString(36).slice(2, 6)}`,
          org,
          '#00FFAA'
        );
      }
      const assignee = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      return {
        inputs: {
          submitter,
          organization: ctx.organization,
          sponsorTierId: tier.sponsorTierId,
          assigneeUserId: assignee?.userId
        }
      };
    },
    async run({ submitter, organization, sponsorTierId, assigneeUserId }) {
      const name = `Bench Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await FinanceServices.createSponsor(
        submitter,
        name,
        true,
        1000,
        new Date(),
        [new Date().getFullYear()],
        sponsorTierId,
        false,
        'contact@example.com',
        [
          {
            dueDate: new Date(Date.now() + 7 * 86400000),
            notifyDate: new Date(Date.now() + 6 * 86400000),
            assigneeUserId,
            notes: 'Welcome task'
          }
        ],
        organization
      );
    }
  },
  {
    name: 'finance.editSponsor',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      let sponsor = await prisma.sponsor.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null },
        select: { sponsorId: true }
      });
      if (!sponsor) {
        const tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
        if (!tier) return { skip: 'no sponsor tier' };
        const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
        if (!org) return { skip: 'could not find org' };
        const created = await FinanceServices.createSponsor(
          submitter,
          `Temp Sponsor ${Math.random().toString(36).slice(2, 6)}`,
          true,
          1000,
          new Date(),
          [new Date().getFullYear()],
          tier.sponsorTierId,
          false,
          'contact',
          [],
          org
        );
        sponsor = { sponsorId: created.sponsorId };
      }
      const anyTier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!anyTier) return { skip: 'no tier for edit' };
      return {
        inputs: {
          submitter,
          organization: ctx.organization,
          sponsorId: sponsor.sponsorId,
          activeStatus: true,
          sponsorValue: 1500,
          joinDate: new Date(),
          activeYears: [new Date().getFullYear()],
          sponsorTierId: anyTier.sponsorTierId,
          vendorContact: 'updated',
          taxExempt: false,
          sponsorTasks: []
        }
      };
    },
    async run({
      submitter,
      organization,
      sponsorId,
      activeStatus,
      sponsorValue,
      joinDate,
      activeYears,
      sponsorTierId,
      vendorContact,
      taxExempt,
      sponsorTasks
    }) {
      const name = `Edited Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await FinanceServices.editSponsor(
        submitter,
        organization,
        sponsorId,
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        vendorContact,
        taxExempt,
        sponsorTasks
      );
    }
  },
  {
    name: 'finance.createSponsorTask',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      const assignee = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      let tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tier) {
        tier = await FinanceServices.createSponsorTier(
          submitter,
          `Auto Tier ${Math.random().toString(36).slice(2, 6)}`,
          org,
          '#00FFAA'
        );
      }
      return {
        inputs: {
          submitter,
          organization: ctx.organization,
          sponsorTierId: tier.sponsorTierId,
          assigneeUserId: assignee?.userId
        }
      };
    },
    async run({ submitter, organization, sponsorTierId, assigneeUserId }) {
      const sponsor = await FinanceServices.createSponsor(
        submitter,
        `Temp Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        true,
        1000,
        new Date(),
        [new Date().getFullYear()],
        sponsorTierId,
        false,
        'contact',
        [],
        organization
      );
      await FinanceServices.createSponsorTask(
        submitter,
        organization,
        new Date(Date.now() + 5 * 86400000),
        'bench task',
        sponsor.sponsorId,
        new Date(Date.now() + 4 * 86400000),
        assigneeUserId
      );
    }
  },
  {
    name: 'finance.editSponsorTask',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      let tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tier) {
        tier = await FinanceServices.createSponsorTier(
          submitter,
          `Auto Tier ${Math.random().toString(36).slice(2, 6)}`,
          org,
          '#00FFAA'
        );
      }
      return { inputs: { submitter, organization: ctx.organization, sponsorTierId: tier.sponsorTierId } };
    },
    async run({ submitter, organization, sponsorTierId }) {
      const sponsor = await FinanceServices.createSponsor(
        submitter,
        `Temp Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        true,
        1000,
        new Date(),
        [new Date().getFullYear()],
        sponsorTierId,
        false,
        'contact',
        [],
        organization
      );
      const createdTask = await FinanceServices.createSponsorTask(
        submitter,
        organization,
        new Date(Date.now() + 5 * 86400000),
        'bench task',
        sponsor.sponsorId,
        new Date(Date.now() + 4 * 86400000)
      );
      await FinanceServices.editSponsorTask(
        submitter,
        organization,
        createdTask.sponsorTaskId,
        new Date(Date.now() + 10 * 86400000),
        'updated notes',
        new Date(Date.now() + 9 * 86400000)
      );
    }
  },
  {
    name: 'finance.deleteSponsorTask',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      let tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tier) {
        tier = await FinanceServices.createSponsorTier(
          submitter,
          `Auto Tier ${Math.random().toString(36).slice(2, 6)}`,
          org,
          '#00FFAA'
        );
      }
      return { inputs: { submitter, organization: ctx.organization, sponsorTierId: tier.sponsorTierId } };
    },
    async run({ submitter, organization, sponsorTierId }) {
      const sponsor = await FinanceServices.createSponsor(
        submitter,
        `Temp Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        true,
        1000,
        new Date(),
        [new Date().getFullYear()],
        sponsorTierId,
        false,
        'contact',
        [],
        organization
      );
      const createdTask = await FinanceServices.createSponsorTask(
        submitter,
        organization,
        new Date(Date.now() + 5 * 86400000),
        'bench task',
        sponsor.sponsorId
      );
      await FinanceServices.deleteSponsorTask(createdTask.sponsorTaskId, submitter, organization);
    }
  },
  {
    name: 'finance.deleteSponsor',
    tags: ['finance', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin' };
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      let tier = await prisma.sponsor_Tier.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tier) {
        tier = await FinanceServices.createSponsorTier(
          submitter,
          `Auto Tier ${Math.random().toString(36).slice(2, 6)}`,
          org,
          '#00FFAA'
        );
      }
      return { inputs: { submitter, organization: ctx.organization, sponsorTierId: tier.sponsorTierId } };
    },
    async run({ submitter, organization, sponsorTierId }) {
      const sponsor = await FinanceServices.createSponsor(
        submitter,
        `Temp Sponsor ${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        true,
        1000,
        new Date(),
        [new Date().getFullYear()],
        sponsorTierId,
        false,
        'contact',
        [],
        organization
      );
      await FinanceServices.deleteSponsor(sponsor.sponsorId, submitter, organization);
    }
  }
];
