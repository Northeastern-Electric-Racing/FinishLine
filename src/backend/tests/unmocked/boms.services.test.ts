import { Material_Status, Organization, User } from '@prisma/client';
import { Decimal } from 'decimal.js';
import BillOfMaterialsService from '../../src/services/boms.services';
import { createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin } from '../test-data/users.test-data';
import { HttpException } from '../../src/utils/errors.utils';

describe('BOM Service', () => {
  let organization: Organization;
  let user: User;
  let wbsNum: { carNumber: number; projectNumber: number; workPackageNumber: number };

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(batmanAppAdmin, organization.organizationId);
    const project = await createTestProject(user, organization.organizationId);
    wbsNum = { carNumber: 0, projectNumber: 1, workPackageNumber: 0 };
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('createMaterial', () => {
    it('creates material with minimal fields when NOT_READY_TO_ORDER', async () => {
      const material = await BillOfMaterialsService.createMaterial(
        user,
        'Test Material',
        Material_Status.NOT_READY_TO_ORDER,
        '', // materialTypeName - optional
        '', // manufacturerName - optional
        '', // manufacturerPartNumber - optional
        new Decimal(0),
        0,
        0,
        '',
        wbsNum,
        organization
      );

      expect(material.name).toBe('Test Material');
      expect(material.status).toBe(Material_Status.NOT_READY_TO_ORDER);
      expect(material.manufacturerPartNumber).toBe('N/A');
      expect(material.quantity?.toNumber()).toBe(0);
      expect(material.price).toBe(0);
      expect(material.subtotal).toBe(0);
      expect(material.linkUrl).toBe('');
      expect(material.materialType).toBeUndefined();
      expect(material.manufacturer).toBeUndefined();
    });

    it('creates material with all fields when ORDERED', async () => {
      const materialType = await BillOfMaterialsService.createMaterialType('Test Type', user, organization);
      const manufacturer = await BillOfMaterialsService.createManufacturer(user, 'Test Manufacturer', organization);

      const material = await BillOfMaterialsService.createMaterial(
        user,
        'Test Material',
        Material_Status.ORDERED,
        materialType.name,
        manufacturer.name,
        'PART123',
        new Decimal(5),
        1000,
        5000,
        'http://test.com',
        wbsNum,
        organization
      );

      expect(material.name).toBe('Test Material');
      expect(material.status).toBe(Material_Status.ORDERED);
      expect(material.materialType?.name).toBe('Test Type');
      expect(material.manufacturer?.name).toBe('Test Manufacturer');
      expect(material.manufacturerPartNumber).toBe('PART123');
      expect(material.quantity?.toNumber()).toBe(5);
      expect(material.price).toBe(1000);
      expect(material.subtotal).toBe(5000);
      expect(material.linkUrl).toBe('http://test.com');
    });

    it('fails when required fields are missing for ORDERED status', async () => {
      await expect(
        BillOfMaterialsService.createMaterial(
          user,
          'Test Material',
          Material_Status.ORDERED,
          '', // missing materialTypeName
          '', // missing manufacturerName
          '', // missing manufacturerPartNumber
          new Decimal(0),
          0,
          0,
          '',
          wbsNum,
          organization
        )
      ).rejects.toThrow(new HttpException(400, 'Material Type is required when status is not NOT_READY_TO_ORDER'));
    });
  });

  describe('editMaterial', () => {
    it('allows clearing optional fields when changing to NOT_READY_TO_ORDER and sets defaults', async () => {
      const materialType = await BillOfMaterialsService.createMaterialType('Test Type', user, organization);
      const manufacturer = await BillOfMaterialsService.createManufacturer(user, 'Test Manufacturer', organization);

      const initialMaterial = await BillOfMaterialsService.createMaterial(
        user,
        'Test Material',
        Material_Status.ORDERED,
        materialType.name,
        manufacturer.name,
        'PART123',
        new Decimal(5),
        1000,
        5000,
        'http://test.com',
        wbsNum,
        organization,
        'Test Notes'
      );

      const updatedMaterial = await BillOfMaterialsService.editMaterial(
        user,
        initialMaterial.materialId,
        'Test Material',
        Material_Status.NOT_READY_TO_ORDER,
        '',
        '',
        '',
        new Decimal(0),
        0,
        0,
        '',
        organization
      );

      expect(updatedMaterial.status).toBe(Material_Status.NOT_READY_TO_ORDER);
      expect(updatedMaterial.materialType).toBeUndefined();
      expect(updatedMaterial.manufacturer).toBeUndefined();
      expect(updatedMaterial.manufacturerPartNumber).toBe('N/A');
      expect(updatedMaterial.quantity?.toNumber()).toBe(0);
      expect(updatedMaterial.price).toBe(0);
      expect(updatedMaterial.subtotal).toBe(0);
      expect(updatedMaterial.linkUrl).toBe('');
    });

    it('maintains provided values when editing with NOT_READY_TO_ORDER status', async () => {
      const materialType = await BillOfMaterialsService.createMaterialType('Test Type', user, organization);
      const manufacturer = await BillOfMaterialsService.createManufacturer(user, 'Test Manufacturer', organization);

      const initialMaterial = await BillOfMaterialsService.createMaterial(
        user,
        'Test Material',
        Material_Status.NOT_READY_TO_ORDER,
        '', // empty initially
        '',
        '',
        new Decimal(0),
        0,
        0,
        '',
        wbsNum,
        organization
      );

      // Edit with values while keeping NOT_READY_TO_ORDER
      const updatedMaterial = await BillOfMaterialsService.editMaterial(
        user,
        initialMaterial.materialId,
        'Test Material Updated',
        Material_Status.NOT_READY_TO_ORDER,
        materialType.name,
        manufacturer.name,
        'PART123',
        new Decimal(5),
        1000,
        5000,
        'http://test.com',
        organization,
        'Test Notes'
      );

      expect(updatedMaterial.name).toBe('Test Material Updated');
      expect(updatedMaterial.status).toBe(Material_Status.NOT_READY_TO_ORDER);
      expect(updatedMaterial.materialType?.name).toBe('Test Type');
      expect(updatedMaterial.manufacturer?.name).toBe('Test Manufacturer');
      expect(updatedMaterial.manufacturerPartNumber).toBe('PART123');
      expect(updatedMaterial.quantity?.toNumber()).toBe(5);
      expect(updatedMaterial.price).toBe(1000);
      expect(updatedMaterial.subtotal).toBe(5000);
      expect(updatedMaterial.linkUrl).toBe('http://test.com');
      expect(updatedMaterial.notes).toBe('Test Notes');
    });

    it('requires all fields when changing from NOT_READY_TO_ORDER to ORDERED', async () => {
      const initialMaterial = await BillOfMaterialsService.createMaterial(
        user,
        'Test Material',
        Material_Status.NOT_READY_TO_ORDER,
        '',
        '',
        '',
        new Decimal(0),
        0,
        0,
        '',
        wbsNum,
        organization
      );

      // change to ORDERED without required fields
      await expect(
        BillOfMaterialsService.editMaterial(
          user,
          initialMaterial.materialId,
          'Test Material',
          Material_Status.ORDERED,
          '',
          '',
          '',
          new Decimal(0),
          0,
          0,
          '',
          organization
        )
      ).rejects.toThrow('Material Type');
    });
  });
});
