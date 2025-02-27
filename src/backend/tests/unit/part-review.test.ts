import { Organization } from '@prisma/client';
import { resetUsers, createTestOrganization } from '../test-utils';

describe('Pop Ups Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('runs a test', () => {
    expect(2 + 2).toBe(4);
    expect(orgId).toBeTruthy();
  });
});
