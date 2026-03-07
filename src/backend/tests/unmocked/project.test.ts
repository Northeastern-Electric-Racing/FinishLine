import prisma from '../../src/prisma/prisma.js';
import { createTestReimbursementRequest, resetUsers } from '../test-utils.js';
import { Organization, User } from '@prisma/client';
import BillOfMaterials from '../../src/services/boms.services.js';
import Decimal from 'decimal.js';
import { MaterialStatus, ReimbursementRequest } from 'shared';
import { NotFoundException } from '../../src/utils/errors.utils.js';

describe('Material Tests', () => {
  let org: Organization;
  let reimbursementRequest: ReimbursementRequest;

  let createdUser: User;

  beforeEach(async () => {
    const result = await createTestReimbursementRequest();
    reimbursementRequest = result.rr;
    org = result.organization;
    createdUser = result.user;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create a new material', () => {
    test('Creating a valid material', async () => {
      const materialType = await BillOfMaterials.createMaterialType('Resistor', createdUser, org);
      const manufacturer = await BillOfMaterials.createManufacturer(createdUser, 'Digikey', org);
      const material = await BillOfMaterials.createMaterial(
        createdUser,
        '100k Resistor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org,
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        reimbursementRequest.reimbursementRequestId
      );

      expect(material.name).toEqual('100k Resistor');
      expect(material.linkUrl).toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(material.userCreated.userId).toEqual(createdUser.userId);
      expect(material.price).toEqual(10);
      expect(material.subtotal).toEqual(50);
      expect(material.manufacturerName).toEqual('Digikey');
      expect(material.manufacturerPartNumber).toEqual('lalsd');
      expect(material.quantity?.toString()).toEqual('5');
      expect(material.reimbursementRequest?.reimbursementRequestId).toEqual(reimbursementRequest.reimbursementRequestId);
    });

    test('Fails on invalid reimbursement request id', async () => {
      const materialType = await BillOfMaterials.createMaterialType('Resistor', createdUser, org);
      const manufacturer = await BillOfMaterials.createManufacturer(createdUser, 'Digikey', org);
      await expect(
        async () =>
          await BillOfMaterials.createMaterial(
            createdUser,
            '100k Resistor',
            MaterialStatus.ReadyToOrder,
            materialType.name,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 0
            },
            org,
            manufacturer.name,
            'lalsd',
            new Decimal(5),
            10,
            50,
            undefined,
            undefined,
            undefined,
            undefined,
            'invalid'
          )
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', 'invalid'));
    });
  });

  describe('Copy materials to project', () => {
    test('Successfully copies materials and resets key fields', async () => {
      const materialType = await BillOfMaterials.createMaterialType('Capacitor', createdUser, org);
      const manufacturer = await BillOfMaterials.createManufacturer(createdUser, 'Mouser', org);

      const car = await prisma.car.findFirst({
        where: {
          wbsElement: {
            organizationId: org.organizationId
          }
        }
      });

      await prisma.project.create({
        data: {
          summary: 'Test destination project',
          car: {
            connect: { carId: car!.carId }
          },
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 2,
              workPackageNumber: 0,
              name: 'Destination Project',
              organizationId: org.organizationId
            }
          }
        }
      });

      const material1 = await BillOfMaterials.createMaterial(
        createdUser,
        '100uF Capacitor',
        MaterialStatus.Ordered,
        materialType.name,
        'https://example.com/mat1',
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        org,
        manufacturer.name,
        'CAP-100UF',
        new Decimal(10),
        50,
        500,
        'Test notes',
        undefined,
        undefined,
        undefined,
        reimbursementRequest.reimbursementRequestId
      );

      const material2 = await BillOfMaterials.createMaterial(
        createdUser,
        '220uF Capacitor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        'https://example.com/mat2',
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        org,
        manufacturer.name,
        'CAP-220UF',
        new Decimal(5),
        75,
        375
      );

      const newMaterialIds = await BillOfMaterials.copyMaterialsToProject(
        createdUser,
        [material1.materialId, material2.materialId],
        { carNumber: 0, projectNumber: 2, workPackageNumber: 0 },
        org
      );

      expect(newMaterialIds.length).toBe(2);

      const copiedMaterials = await prisma.material.findMany({
        where: { materialId: { in: newMaterialIds } },
        include: { wbsElement: true }
      });

      const copiedMat1 = copiedMaterials.find((m) => m.name === '100uF Capacitor')!;
      const copiedMat2 = copiedMaterials.find((m) => m.name === '220uF Capacitor')!;

      expect(copiedMat1.wbsElement.projectNumber).toBe(2);
      expect(copiedMat2.wbsElement.projectNumber).toBe(2);

      expect(copiedMat1.status).toBe('NOT_READY_TO_ORDER');
      expect(copiedMat1.userCreatedId).toBe(createdUser.userId);
      expect(copiedMat1.reimbursementRequestId).toBeNull();
      expect(copiedMat1.assemblyId).toBeNull();

      expect(copiedMat1.name).toBe('100uF Capacitor');
      expect(copiedMat1.price).toBe(50);
      expect(copiedMat1.quantity?.toString()).toBe('10');
      expect(copiedMat1.manufacturerPartNumber).toBe('CAP-100UF');
      expect(copiedMat1.notes).toBe('Test notes');

      expect(copiedMat2.status).toBe('NOT_READY_TO_ORDER');
      expect(copiedMat2.reimbursementRequestId).toBeNull();
    });

    test('Fails when material does not exist', async () => {
      await expect(
        BillOfMaterials.copyMaterialsToProject(
          createdUser,
          ['non-existent-id'],
          { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
          org
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Edit a material', () => {
    test('Updates the reimbursement request when originally undefined', async () => {
      const materialType = await BillOfMaterials.createMaterialType('Resistor', createdUser, org);
      const manufacturer = await BillOfMaterials.createManufacturer(createdUser, 'Digikey', org);
      const oldMaterial = await BillOfMaterials.createMaterial(
        createdUser,
        '100k Resistor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org,
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50
      );

      expect(oldMaterial.reimbursementRequest?.reimbursementRequestId).toBeUndefined();

      const newMaterial = await BillOfMaterials.editMaterial(
        createdUser,
        oldMaterial.materialId,
        '100k Resistor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        org,
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        reimbursementRequest.reimbursementRequestId
      );

      expect(newMaterial.reimbursementRequest?.reimbursementRequestId).not.toEqual(
        oldMaterial.reimbursementRequest?.reimbursementRequestId
      );
      expect(newMaterial.reimbursementRequest?.reimbursementRequestId).toEqual(reimbursementRequest.reimbursementRequestId);
    });

    test('Fails on invalid reimbursement request id', async () => {
      const materialType = await BillOfMaterials.createMaterialType('Resistor', createdUser, org);
      const manufacturer = await BillOfMaterials.createManufacturer(createdUser, 'Digikey', org);
      const oldMaterial = await BillOfMaterials.createMaterial(
        createdUser,
        '100k Resistor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org,
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50
      );
      await expect(
        async () =>
          await BillOfMaterials.editMaterial(
            createdUser,
            oldMaterial.materialId,
            '100k Resistor',
            MaterialStatus.ReadyToOrder,
            materialType.name,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            org,
            manufacturer.name,
            'lalsd',
            new Decimal(5),
            10,
            50,
            undefined,
            undefined,
            undefined,
            undefined,
            'invalid'
          )
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', 'invalid'));
    });
  });
});
