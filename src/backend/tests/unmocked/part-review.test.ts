import { NotFoundException } from "../../src/utils/errors.utils";
import { batmanAppAdmin, wonderwomanGuest } from "../test-data/users.test-data";
import OrganizationsService from '../../src/services/organizations.services';
import { createTestOrganization, createTestUser, resetUsers } from "../test-utils";
import prisma from "../../src/prisma/prisma";
import { Organization } from "@prisma/client";

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

  it("Fails if organization does not exist", async () => {
    await expect(OrganizationsService.getAllPartTags('no-id')).rejects.toThrow(new NotFoundException('Organization', 'no-id'));
  });

  it('Succeeds and returns empty array', async () => {
    const partTags = await OrganizationsService.getAllPartTags(organizationID);
    expect(partTags).toBeInstanceOf(Array);
    expect(partTags.length).toEqual(0);
  });

  it('Succeeds and returns part tags', async () => {
    await prisma.partTag.createMany({
      data: [
        {partTagId: "123", name: "Screw", colorHexCode: "#191010", dateCreated: new Date(), organizationId: organizationID},
        {partTagId: "456", name: "Bolt", colorHexCode: "#093121", dateCreated: new Date(), organizationId: organizationID}
      ]
    });

    const partTags = await OrganizationsService.getAllPartTags(organizationID);
    expect(partTags.length).toEqual(2);
    expect(partTags.some(tag => tag.partTagId === '123')).toBeTruthy();
    expect(partTags.some(tag => tag.partTagId === '456')).toBeTruthy();
  });
});