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
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org,
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
      expect(material.subtotal).toMatchObject(50);
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
            manufacturer.name,
            'lalsd',
            new Decimal(5),
            10,
            50,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 0
            },
            org,
            undefined,
            undefined,
            undefined,
            undefined,
            'invalid'
          )
      ).rejects.toThrow(new NotFoundException('Reimbursement Request', 'invalid'));
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
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org
      );

      expect(oldMaterial.reimbursementRequest?.reimbursementRequestId).toBeUndefined();

      const newMaterial = await BillOfMaterials.editMaterial(
        createdUser,
        oldMaterial.materialId,
        '100k Resistor',
        MaterialStatus.ReadyToOrder,
        materialType.name,
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        org,
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
        manufacturer.name,
        'lalsd',
        new Decimal(5),
        10,
        50,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        org
      );
      await expect(
        async () =>
          await BillOfMaterials.editMaterial(
            createdUser,
            oldMaterial.materialId,
            '100k Resistor',
            MaterialStatus.ReadyToOrder,
            materialType.name,
            manufacturer.name,
            'lalsd',
            new Decimal(5),
            10,
            50,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            org,
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
