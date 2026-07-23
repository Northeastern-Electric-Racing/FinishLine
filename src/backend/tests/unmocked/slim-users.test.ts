import { financeMember, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import UsersService from '../../src/services/users.services.js';
import prisma from '../../src/prisma/prisma.js';
import { Organization } from '@prisma/client';

describe('Slim Users Tests', () => {
  let organization: Organization;
  let organizationId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    ({ organizationId } = organization);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('returns members and above but excludes guests', async () => {
    const admin = await createTestUser(supermanAdmin, organizationId);
    const member = await createTestUser(financeMember, organizationId);
    const guest = await createTestUser(theVisitorGuest, organizationId);

    const slimUsers = await UsersService.getAllSlimUsers(organizationId);
    const returnedIds = slimUsers.map((user) => user.userId);

    expect(returnedIds).toEqual(expect.arrayContaining([admin.userId, member.userId]));
    expect(returnedIds).not.toContain(guest.userId);
  });

  it('does not return members of a different organization', async () => {
    // build a second org inline (createTestOrganization reuses a fixed googleAuthId, so it can't run twice)
    const otherCreator = await prisma.user.create({
      data: { firstName: 'Other', lastName: 'Creator', email: 'other-org-creator@test.com', googleAuthId: 'otherOrgCreator' }
    });
    const otherOrganization = await prisma.organization.create({
      data: {
        name: 'Other Org',
        description: '',
        applicationLink: '',
        userCreated: { connect: { userId: otherCreator.userId } }
      }
    });
    await createTestUser(financeMember, otherOrganization.organizationId);

    const slimUsers = await UsersService.getAllSlimUsers(organizationId);

    expect(slimUsers).toHaveLength(0);
  });
});
