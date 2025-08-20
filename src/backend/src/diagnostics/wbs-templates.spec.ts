import prisma from '../prisma/prisma';
import WbsElementTemplatesService from '../services/wbs-element-templates.services';
import { BenchSpec } from './bench-types';

export const wbsTemplateSpecs: BenchSpec<any>[] = [
  {
    name: 'wbs-templates.project.getAllProjectTemplates',
    tags: ['wbs-templates', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      await WbsElementTemplatesService.getAllProjectTemplates(submitter, organization);
    }
  },
  // Work Package Templates — writes
  {
    name: 'wbs-templates.wps.createWPTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          templateName: `WPT Bench ${Date.now()}`,
          templateNotes: 'notes'
        }
      };
    },
    async run({ admin, organization, templateName, templateNotes }) {
      await WbsElementTemplatesService.createWorkPackageTemplate(
        admin,
        templateName,
        templateNotes,
        `WP ${Math.floor(Math.random() * 1000)}`,
        null,
        2,
        [],
        [],
        organization
      );
    }
  },
  {
    name: 'wbs-templates.wps.editWPTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const wpt = await prisma.work_Package_Template.findFirst({
        where: { wbsElementTemplate: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElementTemplate: true }
      });
      if (!admin || !wpt) return { skip: 'missing admin or work package template' };
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          workPackageTemplateId: wpt.wbsElementTemplateId
        }
      };
    },
    async run({ admin, organization, workPackageTemplateId }) {
      await WbsElementTemplatesService.editWorkPackageTemplate(
        admin,
        workPackageTemplateId,
        `WPT Edited ${Date.now()}`,
        'edited notes',
        3,
        null,
        [],
        [],
        `Edited WP ${Math.floor(Math.random() * 1000)}`,
        organization
      );
    }
  },
  {
    name: 'wbs-templates.wps.deleteWPTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      return { inputs: { admin, organization: ctx.organization } };
    },
    async run({ admin, organization }) {
      const created = await WbsElementTemplatesService.createWorkPackageTemplate(
        admin,
        `WPT ToDelete ${Date.now()}`,
        'notes',
        null,
        null,
        null,
        [],
        [],
        organization
      );
      await WbsElementTemplatesService.deleteWorkPackageTemplate(admin, created.workPackageTemplateId, organization);
    }
  },
  {
    name: 'wbs-templates.project.getSingleProjectTemplate',
    tags: ['wbs-templates', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const pt = await prisma.project_Template.findFirst({
        where: { wbsElementTemplate: { organizationId: ctx.organization.organizationId, dateDeleted: null } }
      });
      if (!submitter || !pt) return { skip: 'missing member or project template' };
      return { inputs: { submitter, projectTemplateId: pt.wbsElementTemplateId, organization: ctx.organization } };
    },
    async run({ submitter, projectTemplateId, organization }) {
      await WbsElementTemplatesService.getSingleProjectTemplate(submitter, projectTemplateId, organization);
    }
  },
  // Project Templates — writes
  {
    name: 'wbs-templates.project.createProjectTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!admin || !team) return { skip: 'missing admin or team' };
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          teamId: team.teamId,
          templateName: `PT Bench ${Date.now()}`,
          templateNotes: 'notes'
        }
      };
    },
    async run({ admin, organization, teamId, templateName, templateNotes }) {
      await WbsElementTemplatesService.createProjectTemplate(
        admin,
        templateName,
        templateNotes,
        [],
        organization,
        [
          {
            workPackageTemplateId: undefined,
            templateName: `WPT In PT ${Date.now()}`,
            templateNotes: 'wpt notes',
            workPackageName: `WP In PT ${Math.floor(Math.random() * 1000)}`,
            stage: 'NONE',
            duration: 1,
            descriptionBullets: [],
            blockedBy: []
          }
        ],
        [teamId],
        'summary',
        1000,
        `Project ${Date.now()}`
      );
    }
  },
  {
    name: 'wbs-templates.project.editProjectTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const pt = await prisma.project_Template.findFirst({
        where: { wbsElementTemplate: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElementTemplate: true }
      });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!admin || !pt || !team) return { skip: 'missing admin/project template/team' };
      // Fetch existing WPTs to pass through
      const wpts = await prisma.work_Package_Template.findMany({
        where: { projectTemplateId: pt.wbsElementTemplateId, wbsElementTemplate: { dateDeleted: null } },
        include: { wbsElementTemplate: true }
      });
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          projectTemplateId: pt.wbsElementTemplateId,
          teamId: team.teamId,
          wpts
        }
      };
    },
    async run({ admin, organization, projectTemplateId, teamId, wpts }) {
      await WbsElementTemplatesService.editProjectTemplate(
        admin,
        projectTemplateId,
        `PT Edited ${Date.now()}`,
        'edited notes',
        wpts.map((t: any) => ({
          workPackageTemplateId: t.wbsElementTemplateId,
          templateName: `${t.wbsElementTemplate.templateName}*`,
          templateNotes: t.wbsElementTemplate.templateNotes,
          workPackageName: t.wbsElementTemplate.wbsElementName ?? null,
          stage: t.stage,
          duration: t.duration,
          descriptionBullets: [],
          blockedBy: []
        })),
        [],
        organization,
        [teamId],
        `Proj Name ${Date.now()}`,
        2000,
        'edited summary'
      );
    }
  },
  {
    name: 'wbs-templates.project.deleteProjectTemplate',
    tags: ['wbs-templates', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!admin || !team) return { skip: 'missing admin or team' };
      return { inputs: { admin, organization: ctx.organization, teamId: team.teamId } };
    },
    async run({ admin, organization, teamId }) {
      const created = await WbsElementTemplatesService.createProjectTemplate(
        admin,
        `PT ToDelete ${Date.now()}`,
        'notes',
        [],
        organization,
        [],
        [teamId],
        'summary',
        500,
        `Proj ${Date.now()}`
      );
      await WbsElementTemplatesService.deleteProjectTemplate(admin, created.projectTemplateId, organization);
    }
  },

  // Work Package Templates — reads
  {
    name: 'wbs-templates.wps.getAllWPTemplates',
    tags: ['wbs-templates', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      await WbsElementTemplatesService.getAllWorkPackageTemplates(submitter, organization);
    }
  },
  {
    name: 'wbs-templates.wps.getSingleWPTemplate',
    tags: ['wbs-templates', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const wpt = await prisma.work_Package_Template.findFirst({
        where: { wbsElementTemplate: { organizationId: ctx.organization.organizationId, dateDeleted: null } }
      });
      if (!submitter || !wpt) return { skip: 'missing member or work package template' };
      return { inputs: { submitter, workPackageTemplateId: wpt.wbsElementTemplateId, organization: ctx.organization } };
    },
    async run({ submitter, workPackageTemplateId, organization }) {
      await WbsElementTemplatesService.getSingleWorkPackageTemplate(submitter, workPackageTemplateId, organization);
    }
  }
];
