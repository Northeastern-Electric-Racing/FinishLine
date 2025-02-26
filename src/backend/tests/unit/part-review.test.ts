import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import PartReviewService from '../../src/services/part-review.services';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException } from '../../src/utils/errors.utils';

describe('part review tags create update and delete', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let nonAdmin: User;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    nonAdmin = await createTestUser(aquamanLeadership, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates a part tag, edits it, and deletes it', async () => {
    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    const prismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(partTag.name).toBe('practice');
    expect(partTag.colorHexCode).toBe('#ad6454');
    expect(prismaTag?.name).toBe('practice');
    expect(prismaTag?.colorHexCode).toBe('#ad6454');

    const updatedPartTag = await PartReviewService.updatePartTag(partTag.partTagId, 'important', '#000000', superman, orgId);

    const updatedPrismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(updatedPartTag.name).toBe('important');
    expect(updatedPartTag.colorHexCode).toBe('#000000');
    expect(updatedPrismaTag?.name).toBe('important');
    expect(updatedPrismaTag?.colorHexCode).toBe('#000000');

    await PartReviewService.deletePartTag(partTag.partTagId, batman, orgId);
    const deletedPrismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(deletedPrismaTag?.dateDeleted).toBeTruthy();
  });

  it('does not let non-admins create, edit, or delete part tags', async () => {
    await expect(async () => await PartReviewService.createPartTag('name', '#000000', nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('create part review tag')
    );

    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    await expect(
      async () => await PartReviewService.updatePartTag(partTag.partTagId, 'some thing', 'some thing', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update part review tag'));

    await expect(async () => await PartReviewService.deletePartTag(partTag.partTagId, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete part review tag')
    );
  });

  it('does not allow updating deleted common mistake', async () => {
    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    await PartReviewService.deletePartTag(partTag.partTagId, superman, orgId);

    await expect(
      async () => await PartReviewService.updatePartTag(partTag.partTagId, 'asdf', 'asdf', batman, orgId)
    ).rejects.toThrow(new DeletedException('Part Tag', partTag.partTagId));
  });
});
