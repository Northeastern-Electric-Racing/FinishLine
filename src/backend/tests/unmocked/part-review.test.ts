import { NotFoundException } from '../../src/utils/errors.utils';
import OrganizationsService from '../../src/services/organizations.services';
import { createTestOrganization, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { Organization } from '@prisma/client';

describe('Get All Part Tags', () => {
  let organizationID: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    organizationID = organization.organizationId;
    await prisma.partTag.deleteMany();
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('Fails if organization does not exist', async () => {
    await expect(OrganizationsService.getAllPartTags('no-id')).rejects.toThrow(
      new NotFoundException('Organization', 'no-id')
    );
  });

  it('Succeeds and returns empty array', async () => {
    const partTags = await OrganizationsService.getAllPartTags(organizationID);
    expect(partTags).toBeInstanceOf(Array);
    expect(partTags.length).toEqual(0);
  });

  it('Succeeds and returns part tags', async () => {
    await prisma.partTag.createMany({
      data: [
        {
          partTagId: '123',
          name: 'Screw',
          colorHexCode: '#191010',
          dateCreated: new Date(),
          organizationId: organizationID
        },
        { partTagId: '456', name: 'Bolt', colorHexCode: '#093121', dateCreated: new Date(), organizationId: organizationID }
      ]
    });


  // Create a partTag belonging to a different organization
  const organization2 = await createTestOrganization();
  await prisma.partTag.create({
    data: {
      partTagId: '973',
      name: 'Nut',
      colorHexCode: '#920323',
      dateCreated: new Date(),
      organizationId: organization2.organizationId
    }
  });

  // Create a deleted partTag for the same organization
  await prisma.partTag.create({
    data: {
      partTagId: '345',
      name: 'Washer',
      colorHexCode: '#983434',
      dateCreated: new Date(),
      organizationId: organizationID,
      dateDeleted: new Date(), // Marked as deleted
    }
  });

    const partTags = await OrganizationsService.getAllPartTags(organizationID);
    expect(partTags.length).toEqual(2);
    expect(partTags.every(tag => tag.hasOwnProperty('parts'))).toBeTruthy();
    expect(partTags.some((tag) => tag.parts.some(part => part.partId === '973'))).toBeFalsy();
    expect(partTags.some((tag) => tag.parts.some(part => part.partId === '345'))).toBeFalsy();
  });
});
