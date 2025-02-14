import { NotFoundException } from '../../src/utils/errors.utils';
import OrganizationsService from '../../src/services/organizations.services';
import { createTestOrganization, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { Organization } from '@prisma/client';

export const createTestOrganization2 = async () => {
  const user = await prisma.user.create({
    data: {
      firstName: 'Admin2',
      lastName: 'User2',
      email: 'admin2@gmail.com',
      googleAuthId: 'organizationCreator2'
    }
  });

  return await prisma.organization.create({
    data: {
      name: 'Joe mama2',
      description: 'Joe mama2`s organization',
      applicationLink: '',
      userCreated: {
        connect: {
          userId: user.userId
        }
      }
    }
  });
};

describe('Get All Part Tags', () => {
  let organizationID: string;
  let organizationID2: string;
  let organization: Organization;
  let organization2: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    organization2 = await createTestOrganization2();
    organizationID = organization.organizationId;
    organizationID2 = organization2.organizationId;
    await prisma.partTag.deleteMany();
  });

  afterEach(async () => {
    await resetUsers();
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
    await prisma.partTag.create({
      data: {
        partTagId: '973',
        name: 'Nut',
        colorHexCode: '#920323',
        dateCreated: new Date(),
        organizationId: organizationID2
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
        dateDeleted: new Date() // Marked as deleted
      }
    });

  const partTags = await OrganizationsService.getAllPartTags(organizationID);  
  expect(partTags.length).toEqual(2);
  expect(partTags).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ partTagId: '123', name: 'Screw', colorHexCode: '#191010' }),
      expect.objectContaining({ partTagId: '456', name: 'Bolt', colorHexCode: '#093121' })
    ])
  );

  expect(partTags.some((tag) => tag.partTagId === '345')).toBeFalsy();
  expect(partTags.some((tag) => tag.partTagId === '973')).toBeFalsy();
})});