import { createTestReimbursementRequest, resetUsers } from '../test-utils';
import { Organization, User } from '@prisma/client';
import BillOfMaterials from '../../src/services/boms.services';
import Decimal from 'decimal.js';
import { MaterialStatus, ReimbursementRequest } from 'shared';
import { NotFoundException } from '../../src/utils/errors.utils';

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
    expect(material.userCreatedId).toEqual(createdUser.userId);
    expect(material.price).toEqual(10);
    expect(material.subtotal).toMatchObject(50);
    expect(material.reimbursementRequestId).toEqual(reimbursementRequest.reimbursementRequestId);
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
