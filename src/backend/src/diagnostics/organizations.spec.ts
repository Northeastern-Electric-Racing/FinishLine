import prisma from '../prisma/prisma';
import OrganizationsService from '../services/organizations.services';
import { BenchSpec } from './bench-types';

export const organizationSpecs: BenchSpec<any>[] = [
  {
    name: 'organizations.getAllOrganizations',
    tags: ['organizations', 'read'],
    async prepare() {
      return { inputs: {} };
    },
    async run() {
      await OrganizationsService.getAllOrganizations();
    }
  },
  {
    name: 'organizations.getCurrentOrganization',
    tags: ['organizations', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await OrganizationsService.getCurrentOrganization(organizationId);
    }
  },
  {
    name: 'organizations.getAllUsefulLinks',
    tags: ['organizations', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await OrganizationsService.getAllUsefulLinks(organizationId);
    }
  },
  {
    name: 'organizations.getOrganizationImages',
    tags: ['organizations', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await OrganizationsService.getOrganizationImages(organizationId);
    }
  },
  {
    name: 'organizations.getOrganizationFeaturedProjects',
    tags: ['organizations', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await OrganizationsService.getOrganizationFeaturedProjects(organizationId);
    }
  },
  {
    name: 'organizations.getPartReviewGuideLink',
    tags: ['organizations', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      return { inputs: { organizationId: ctx.organization.organizationId, submitter } };
    },
    async run({ organizationId, submitter }) {
      await OrganizationsService.getPartReviewGuideLink(organizationId, submitter);
    }
  },
  {
    name: 'organizations.setUsefulLinks',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin user' };
      const { organizationId } = ctx.organization;
      const links = [
        { linkId: '-1', linkTypeName: 'Confluence', url: 'https://confluence.example.com' },
        { linkId: '-1', linkTypeName: 'Bill of Materials', url: 'https://bom.example.com' }
      ];
      return { inputs: { submitter, organizationId, links } };
    },
    async run({ submitter, organizationId, links }) {
      await OrganizationsService.setUsefulLinks(submitter, organizationId, links);
    }
  },
  {
    name: 'organizations.updateApplicationLink',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const organization = await prisma.organization.findUnique({
        where: { organizationId: ctx.organization.organizationId }
      });
      if (!submitter || !organization) return { skip: 'missing submitter or organization' };
      return { inputs: { submitter, organization, newLink: 'https://apply.example.com' } };
    },
    async run({ submitter, newLink, organization }) {
      await OrganizationsService.updateApplicationLink(submitter, newLink, organization);
    }
  },
  {
    name: 'organizations.setOnboardingText',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const organization = await prisma.organization.findUnique({
        where: { organizationId: ctx.organization.organizationId }
      });
      if (!submitter || !organization) return { skip: 'missing submitter or organization' };
      return { inputs: { submitter, organization, text: 'Welcome to the team!' } };
    },
    async run({ submitter, organization, text }) {
      await OrganizationsService.setOnboardingText(submitter, organization, text);
    }
  },
  {
    name: 'organizations.updateOrganizationContacts',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const organization = await prisma.organization.findUnique({
        where: { organizationId: ctx.organization.organizationId }
      });
      if (!user || !organization) return { skip: 'missing admin user or organization' };
      const member = await prisma.user.findFirst({
        where: { roles: { some: { organizationId: organization.organizationId } } },
        select: { userId: true }
      });
      if (!member) return { skip: 'no member to assign as contact' };
      const contacts = [{ userId: member.userId, title: 'Chief Software Engineer' }];
      return { inputs: { user, organization, contacts } };
    },
    async run({ user, organization, contacts }) {
      await OrganizationsService.updateOrganizationContacts(user, organization, contacts);
    }
  },
  {
    name: 'organizations.setFeaturedProjects',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const organization = await prisma.organization.findUnique({
        where: { organizationId: ctx.organization.organizationId }
      });
      if (!submitter || !organization) return { skip: 'missing submitter or organization' };
      const projects = await prisma.project.findMany({
        where: { wbsElement: { organizationId: organization.organizationId, dateDeleted: null } },
        select: { projectId: true },
        take: 3
      });
      if (projects.length === 0) return { skip: 'no projects found to feature' };
      const projectIds = projects.map((p) => p.projectId);
      return { inputs: { projectIds, organization, submitter } };
    },
    async run({ projectIds, organization, submitter }) {
      await OrganizationsService.setFeaturedProjects(projectIds, organization, submitter);
    }
  },
  {
    name: 'organizations.setOrganizationDescription',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const organization = await prisma.organization.findUnique({
        where: { organizationId: ctx.organization.organizationId }
      });
      if (!submitter || !organization) return { skip: 'missing submitter or organization' };
      return { inputs: { description: 'An awesome student-led organization.', submitter, organization } };
    },
    async run({ description, submitter, organization }) {
      await OrganizationsService.setOrganizationDescription(description, submitter, organization);
    }
  },
  {
    name: 'organizations.setSlackWorkspaceId',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin submitter' };
      return { inputs: { workspaceId: 'T12345', submitter, organizationId: ctx.organization.organizationId } };
    },
    async run({ workspaceId, submitter, organizationId }) {
      await OrganizationsService.setSlackWorkspaceId(workspaceId, submitter, organizationId);
    }
  },
  {
    name: 'organizations.setPartReviewGuideLink',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin submitter' };
      return {
        inputs: { submitter, organizationId: ctx.organization.organizationId, guideLink: 'https://guide.example.com' }
      };
    },
    async run({ submitter, organizationId, guideLink }) {
      await OrganizationsService.setPartReviewGuideLink(submitter, organizationId, guideLink);
    }
  },
  {
    name: 'organizations.setSlackSponsorshipNotificationSlackChannelId',
    tags: ['organizations', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin submitter' };
      return { inputs: { submitter, organizationId: ctx.organization.organizationId, channelId: 'C123456' } };
    },
    async run({ submitter, organizationId, channelId }) {
      await OrganizationsService.setSlackSponsorshipNotificationSlackChannelId(channelId, submitter, organizationId);
    }
  },
  {
    name: 'organizations.setImages',
    tags: ['organizations', 'write'],
    async prepare() {
      return { skip: 'requires file upload; skipped in bench' };
    },
    async run() {}
  },
  {
    name: 'organizations.setLogoImage',
    tags: ['organizations', 'write'],
    async prepare() {
      return { skip: 'requires file upload; skipped in bench' };
    },
    async run() {}
  }
];
