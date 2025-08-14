import prisma from '../prisma/prisma';
import ProjectsService from '../services/projects.services';
import WorkPackagesService from '../services/work-packages.services';
import { BenchSpec } from './bench-types';

export const wbsSpecs: BenchSpec<any>[] = [
  {
    name: 'wbs.projects.getAllProjects',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization, includeDeleted: false } };
    },
    async run({ organization, includeDeleted }) {
      await ProjectsService.getAllProjects(organization, includeDeleted);
    }
  },
  {
    name: 'wbs.projects.getSingleProject',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      return {
        inputs: {
          wbsNum: {
            carNumber: proj.wbsElement.carNumber,
            projectNumber: proj.wbsElement.projectNumber,
            workPackageNumber: proj.wbsElement.workPackageNumber
          },
          organization: ctx.organization
        }
      };
    },
    async run({ wbsNum, organization }) {
      await ProjectsService.getSingleProject(wbsNum, organization);
    }
  },
  {
    name: 'wbs.projects.getUsersLeadingProjects',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await ProjectsService.getUsersLeadingProjects(user, organization);
    }
  },
  {
    name: 'wbs.projects.getUsersTeamsProjects',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await ProjectsService.getUsersTeamsProjects(user, organization);
    }
  },
  {
    name: 'wbs.projects.getTeamsProjects',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!team) return { skip: 'no team found' };
      return { inputs: { organization: ctx.organization, teamId: team.teamId } };
    },
    async run({ organization, teamId }) {
      await ProjectsService.getTeamsProjects(organization, teamId);
    }
  },
  // Projects — writes (non-destructive)
  {
    name: 'wbs.projects.setAbbreviation',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!user || !proj) return { skip: 'missing admin or project' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { wbsNum, user, organization: ctx.organization, abbreviation: 'ABB' } };
    },
    async run({ wbsNum, user, organization, abbreviation }) {
      await ProjectsService.setAbbreviation(wbsNum, user, organization, abbreviation);
    }
  },
  {
    name: 'wbs.projects.deleteAbbreviation',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!user || !proj) return { skip: 'missing admin or project' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      // ensure abbreviation exists
      await ProjectsService.setAbbreviation(wbsNum, user, org, 'ABB');
      return { inputs: { wbsNum, user, organization: ctx.organization } };
    },
    async run({ wbsNum, user, organization }) {
      await ProjectsService.deleteAbbreviation(wbsNum, user, organization);
    }
  },
  // Work packages — reads (light coverage, non-destructive)
  {
    name: 'wbs.work-packages.getSingle',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const wp = await prisma.work_Package.findFirst({
        where: { project: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } } },
        include: { wbsElement: true }
      });
      if (!wp) return { skip: 'no work package found' };
      return {
        inputs: {
          wbsNum: {
            carNumber: wp.wbsElement.carNumber,
            projectNumber: wp.wbsElement.projectNumber,
            workPackageNumber: wp.wbsElement.workPackageNumber
          },
          organization: ctx.organization
        }
      };
    },
    async run({ wbsNum, organization }) {
      await WorkPackagesService.getSingleWorkPackage(wbsNum, organization);
    }
  },
  {
    name: 'wbs.work-packages.getProjectWorkPackages',
    tags: ['wbs', 'read'],
    async prepare() {
      return { skip: 'removed (no direct service) — covered by project reads' };
    },
    async run() {}
  },
  {
    name: 'wbs.work-packages.getAllWorkPackages',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization, query: {} } };
    },
    async run({ organization, query }) {
      await WorkPackagesService.getAllWorkPackages(query, organization);
    }
  },
  {
    name: 'wbs.work-packages.getManyWorkPackages',
    tags: ['wbs', 'read'],
    async prepare(ctx) {
      const wps = await prisma.work_Package.findMany({
        where: { project: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } } },
        include: { wbsElement: true },
        take: 2
      });
      if (wps.length < 2) return { skip: 'need at least 2 work packages' };
      const wbsNums = wps.map((wp) => ({
        carNumber: wp.wbsElement.carNumber,
        projectNumber: wp.wbsElement.projectNumber,
        workPackageNumber: wp.wbsElement.workPackageNumber
      }));
      return { inputs: { organization: ctx.organization, wbsNums } };
    },
    async run({ organization, wbsNums }) {
      await WorkPackagesService.getManyWorkPackages(wbsNums, organization);
    }
  },
  // Projects — writes (create/edit/team/favorite/link types/delete)
  {
    name: 'wbs.projects.createProject',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!user || !proj || !team) return { skip: 'missing user/project/team' };
      return {
        inputs: {
          user,
          carNumber: proj.wbsElement.carNumber,
          name: `Bench Proj ${Date.now()}`,
          summary: 'summary',
          teamIds: [team.teamId],
          budget: 1000,
          organization: ctx.organization
        }
      };
    },
    async run({ user, carNumber, name, summary, teamIds, budget, organization }) {
      await ProjectsService.createProject(
        user,
        null,
        carNumber,
        name,
        summary,
        teamIds,
        budget,
        null,
        [],
        null,
        null,
        organization
      );
    }
  },
  {
    name: 'wbs.projects.editProject',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } }
      });
      const cr = await prisma.change_Request.findFirst({ where: { accepted: true } });
      if (!user || !proj || !cr) return { skip: 'missing user/project/accepted cr' };
      return { inputs: { user, projectId: proj.projectId, crId: cr.crId, organization: ctx.organization } };
    },
    async run({ user, projectId, crId, organization }) {
      await ProjectsService.editProject(
        user,
        projectId,
        crId,
        `Edited Proj ${Date.now()}`,
        2000,
        'edited summary',
        [],
        [],
        null,
        null,
        organization
      );
    }
  },
  {
    name: 'wbs.projects.setProjectTeam_toggle',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!admin || !proj || !team) return { skip: 'missing admin/project/team' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { admin, organization: ctx.organization, wbsNum, teamId: team.teamId } };
    },
    async run({ admin, organization, wbsNum, teamId }) {
      await ProjectsService.setProjectTeam(admin, wbsNum, teamId, organization);
    }
  },
  {
    name: 'wbs.projects.toggleFavorite',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!user || !proj) return { skip: 'missing user/project' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { user, organization: ctx.organization, wbsNum } };
    },
    async run({ user, organization, wbsNum }) {
      await ProjectsService.toggleFavorite(wbsNum, user, organization);
    }
  },
  {
    name: 'wbs.projects.createLinkType',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'missing admin' };
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          name: `BenchLink-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        }
      };
    },
    async run({ admin, organization, name }) {
      try {
        await ProjectsService.createLinkType(admin, name, 'LinkIcon', false, organization);
      } catch (e) {
        // ignore if exists to keep benchmark flowing across warmups/runs
      }
    }
  },
  {
    name: 'wbs.projects.editLinkType',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'missing admin' };
      const name = `BenchLink-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      await ProjectsService.createLinkType(admin, name, 'Icon', false, org);
      return { inputs: { admin, organization: ctx.organization, name } };
    },
    async run({ admin, organization, name }) {
      await ProjectsService.editLinkType(name, 'NewIcon', true, admin, organization);
    }
  },
  {
    name: 'wbs.projects.deleteProject',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!admin || !proj) return { skip: 'missing admin or base project for car number' };
      return { inputs: { admin, organization: ctx.organization, carNumber: proj.wbsElement.carNumber } };
    },
    async run({ admin, organization, carNumber }) {
      const created = await ProjectsService.createProject(
        admin,
        null,
        carNumber,
        `Temp Proj ${Date.now()}`,
        's',
        [],
        0,
        null,
        [],
        null,
        null,
        organization
      );
      await ProjectsService.deleteProject(admin, created.wbsNum, organization);
    }
  },
  // Work packages — writes
  {
    name: 'wbs.work-packages.createWorkPackage',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!user || !proj) return { skip: 'missing user or project' };
      return { inputs: { user, organization: ctx.organization, carNumber: proj.wbsElement.carNumber } };
    },
    async run({ user, organization, carNumber }) {
      // create a temp project to avoid WP number collisions across runs
      const createdProj = await ProjectsService.createProject(
        user,
        null,
        carNumber,
        `WP Host Proj ${Date.now()}`,
        's',
        [],
        0,
        null,
        [],
        null,
        null,
        organization
      );
      await WorkPackagesService.createWorkPackage(
        user,
        `Bench WP ${Date.now()}`,
        null,
        null,
        new Date(Date.now() + 86400000).toISOString(),
        2,
        [],
        [],
        createdProj.wbsNum,
        organization
      );
    }
  },
  {
    name: 'wbs.work-packages.editWorkPackage',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const wp = await prisma.work_Package.findFirst({
        where: { project: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } } },
        include: { wbsElement: true }
      });
      const cr = await prisma.change_Request.findFirst({ where: { accepted: true } });
      if (!user || !wp || !cr) return { skip: 'missing user/work package/accepted cr' };
      return { inputs: { user, organization: ctx.organization, workPackageId: wp.workPackageId, crId: cr.crId } };
    },
    async run({ user, organization, workPackageId, crId }) {
      await WorkPackagesService.editWorkPackage(
        user,
        workPackageId,
        `Edited WP ${Date.now()}`,
        crId,
        null,
        new Date(Date.now() + 2 * 86400000).toISOString(),
        3,
        [],
        [],
        null,
        null,
        organization
      );
    }
  },
  {
    name: 'wbs.work-packages.deleteWorkPackage',
    tags: ['wbs', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!admin || !proj) return { skip: 'missing admin or project' };
      const projectWbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { admin, organization: ctx.organization, projectWbsNum } };
    },
    async run({ admin, organization, projectWbsNum }) {
      // create a temp project to host the WP to delete
      const hostProj = await ProjectsService.createProject(
        admin,
        null,
        projectWbsNum.carNumber,
        `WP Delete Host ${Date.now()}`,
        's',
        [],
        0,
        null,
        [],
        null,
        null,
        organization
      );
      const created = await WorkPackagesService.createWorkPackage(
        admin,
        `Temp WP ${Date.now()}`,
        null,
        null,
        new Date(Date.now() + 86400000).toISOString(),
        1,
        [],
        [],
        hostProj.wbsNum,
        organization
      );
      await WorkPackagesService.deleteWorkPackage(admin, created.wbsNum, organization);
    }
  }
];
