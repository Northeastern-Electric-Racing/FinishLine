import prisma from '../prisma/prisma';
import BillOfMaterialsService from '../services/boms.services';
import { BenchSpec } from './bench-types';
import Decimal from 'decimal.js';
import { Material_Status } from '@prisma/client';

export const bomSpecs: BenchSpec<any>[] = [
  {
    name: 'bom.getAllManufacturers',
    tags: ['bom', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      await BillOfMaterialsService.getAllManufacturers(submitter, organization);
    }
  },
  {
    name: 'bom.getAllUnits',
    tags: ['bom', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      await BillOfMaterialsService.getAllUnits(submitter, organization);
    }
  },
  {
    name: 'bom.getAllMaterialTypes',
    tags: ['bom', 'read'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no member user' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      await BillOfMaterialsService.getAllMaterialTypes(submitter, organization);
    }
  },
  {
    name: 'bom.getAssembliesForWbsElement',
    tags: ['bom', 'read'],
    async prepare(ctx) {
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
      return { inputs: { wbsNum, organization: ctx.organization } };
    },
    async run({ wbsNum, organization }) {
      await BillOfMaterialsService.getAssembliesForWbsElement(wbsNum, organization);
    }
  },
  {
    name: 'bom.getMaterialsForWbsElement',
    tags: ['bom', 'read'],
    async prepare(ctx) {
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
      return { inputs: { wbsNum, organization: ctx.organization } };
    },
    async run({ wbsNum, organization }) {
      await BillOfMaterialsService.getMaterialsForWbsElement(wbsNum, organization);
    }
  },
  // Writes — prefer idempotent updates or safe re-writes per run
  {
    name: 'bom.editAssembly',
    tags: ['bom', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no project found' };
      // ensure an assembly exists on this WBS element we can repeatedly edit
      let assembly = await prisma.assembly.findFirst({
        where: { wbsElementId: proj.wbsElementId, dateDeleted: null }
      });
      if (!assembly) {
        const wbsNum = {
          carNumber: proj.wbsElement.carNumber,
          projectNumber: proj.wbsElement.projectNumber,
          workPackageNumber: proj.wbsElement.workPackageNumber
        };
        const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
        if (!org) return { skip: 'failed to find organization' };
        const created = await BillOfMaterialsService.createAssembly('bench-assembly', admin, wbsNum, org);
        assembly = await prisma.assembly.findUnique({ where: { assemblyId: created.assemblyId } });
      }
      if (!assembly) return { skip: 'failed to create assembly' };
      return { inputs: { admin, organization: ctx.organization, assemblyId: assembly.assemblyId } };
    },
    async run({ admin, organization, assemblyId }) {
      await BillOfMaterialsService.editAssembly(admin, assemblyId, organization, 'bench-assembly-edited', 'bench-pdm');
    }
  },
  {
    name: 'bom.createAssembly',
    tags: ['bom', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
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
      return { inputs: { admin, organization: ctx.organization, wbsNum } };
    },
    async run({ admin, organization, wbsNum }) {
      // unique-ish name per run to avoid conflicts
      const name = `bench-assembly-${Math.random().toString(36).slice(2, 8)}`;
      await BillOfMaterialsService.createAssembly(name, admin, wbsNum, organization);
    }
  },
  {
    name: 'bom.createMaterial',
    tags: ['bom', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
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
      // ensure supporting entities exist
      const materialType = await prisma.material_Type.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
      });
      let materialTypeName = materialType?.name;
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'failed to find organization' };
      if (!materialTypeName) {
        await BillOfMaterialsService.createMaterialType('Bench-Material-Type', admin, org);
        materialTypeName = 'Bench-Material-Type';
      }
      const manufacturer = await prisma.manufacturer.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
      });
      let manufacturerName = manufacturer?.name;
      if (!manufacturer) {
        await BillOfMaterialsService.createManufacturer(admin, 'Bench-Manufacturer', org);
        manufacturerName = 'Bench-Manufacturer';
      }
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          wbsNum,
          materialTypeName,
          manufacturerName
        }
      };
    },
    async run({ admin, organization, wbsNum, materialTypeName, manufacturerName }) {
      await BillOfMaterialsService.createMaterial(
        admin,
        `Bench Material ${Math.random().toString(36).slice(2, 6)}`,
        Material_Status.NOT_READY_TO_ORDER,
        materialTypeName,
        manufacturerName,
        'MPN-123',
        new Decimal(1),
        100,
        100,
        'https://example.com',
        wbsNum,
        organization,
        'notes'
      );
    }
  },
  {
    name: 'bom.editMaterial',
    tags: ['bom', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      // find a material; if none, create one to edit
      let material = await prisma.material.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId }, dateDeleted: null },
        include: { wbsElement: true }
      });
      if (!material) {
        const proj = await prisma.project.findFirst({
          where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
          include: { wbsElement: true }
        });
        if (!proj) return { skip: 'no project to create material for' };
        const wbsNum = {
          carNumber: proj.wbsElement.carNumber,
          projectNumber: proj.wbsElement.projectNumber,
          workPackageNumber: proj.wbsElement.workPackageNumber
        };
        const materialType = await prisma.material_Type.findFirst({
          where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
        });
        const manufacturer = await prisma.manufacturer.findFirst({
          where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
        });
        if (!materialType || !manufacturer) return { skip: 'no material type or manufacturer' };
        const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
        if (!org) return { skip: 'could not find organization' };
        const created = await BillOfMaterialsService.createMaterial(
          admin,
          'bench-editable',
          Material_Status.NOT_READY_TO_ORDER,
          materialType.name,
          manufacturer.name,
          'MPN-EDIT',
          new Decimal(1),
          50,
          50,
          'https://example.com',
          wbsNum,
          org
        );
        material = await prisma.material.findUnique({
          where: { materialId: created.materialId },
          include: { wbsElement: true }
        });
      }
      if (!material) return { skip: 'no material available' };
      const materialType = await prisma.material_Type.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
      });
      const manufacturer = await prisma.manufacturer.findFirst({
        where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
      });
      if (!materialType || !manufacturer) return { skip: 'no material type or manufacturer' };
      return {
        inputs: {
          admin,
          organization: ctx.organization,
          materialId: material.materialId,
          materialTypeName: materialType.name,
          manufacturerName: manufacturer.name
        }
      };
    },
    async run({ admin, organization, materialId, materialTypeName, manufacturerName }) {
      await BillOfMaterialsService.editMaterial(
        admin,
        materialId,
        'bench-updated',
        Material_Status.READY_TO_ORDER,
        materialTypeName,
        manufacturerName,
        'MPN-UPDATED',
        new Decimal(2),
        200,
        400,
        'https://example.com/updated',
        organization,
        'updated notes'
      );
    }
  },
  {
    name: 'bom.assignMaterialAssembly',
    tags: ['bom', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
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
      // ensure an assembly exists
      let assembly = await prisma.assembly.findFirst({ where: { wbsElementId: proj.wbsElementId, dateDeleted: null } });
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return { skip: 'could not find org' };
      if (!assembly) {
        const created = await BillOfMaterialsService.createAssembly('bench-assign', admin, wbsNum, org);
        assembly = await prisma.assembly.findUnique({ where: { assemblyId: created.assemblyId } });
      }
      // ensure a material exists on this wbsElement
      let material = await prisma.material.findFirst({
        where: { wbsElementId: proj.wbsElementId, dateDeleted: null },
        include: { wbsElement: true }
      });
      if (!material) {
        const materialType = await prisma.material_Type.findFirst({
          where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
        });
        const manufacturer = await prisma.manufacturer.findFirst({
          where: { organizationId: ctx.organization.organizationId, dateDeleted: null }
        });
        if (!materialType || !manufacturer) return { skip: 'no material type or manufacturer' };
        const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
        if (!org) return { skip: 'could not find org' };
        const created = await BillOfMaterialsService.createMaterial(
          admin,
          'bench-to-assign',
          Material_Status.NOT_READY_TO_ORDER,
          materialType.name,
          manufacturer.name,
          'MPN-ASSIGN',
          new Decimal(1),
          10,
          10,
          'https://example.com',
          wbsNum,
          org
        );
        material = await prisma.material.findUnique({
          where: { materialId: created.materialId },
          include: { wbsElement: true }
        });
      }
      if (!assembly || !material) return { skip: 'failed to create assembly/material for assignment' };
      return {
        inputs: { admin, organization: ctx.organization, materialId: material.materialId, assemblyId: assembly.assemblyId }
      };
    },
    async run({ admin, organization, materialId, assemblyId }) {
      await BillOfMaterialsService.assignMaterialAssembly(admin, materialId, organization, assemblyId);
    }
  }
];
