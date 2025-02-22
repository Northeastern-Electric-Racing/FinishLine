import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import PartReviewService from '../../src/services/part-review.service.ts';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership } from '../test-data/users.test-data.ts';
import prisma from '../../src/prisma/prisma.ts';
import { AccessDeniedAdminOnlyException, DeletedException } from '../../src/utils/errors.utils.ts';

describe('part review common mistakes create update and delete', () => {
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

  it('creates a common mistake, edits it, and deletes it', async () => {
    const commonMistake = await PartReviewService.createCommonMistake(
      'some title',
      'some description',
      false,
      batman,
      orgId
    );
    const prismaCommonMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        id: commonMistake.id
      }
    });

    expect(prismaCommonMistake?.title).toBe('some title');
    expect(prismaCommonMistake?.description).toBe('some description');
    expect(prismaCommonMistake?.starred).toBe(false);
    expect(prismaCommonMistake?.userCreatedId).toBe(batman.userId);
    expect(prismaCommonMistake?.organizationId).toBe(orgId);
    expect(commonMistake?.title).toBe('some title');
    expect(commonMistake?.description).toBe('some description');
    expect(commonMistake?.starred).toBe(false);

    const updatedCommonMistake = await PartReviewService.updateCommonMistake(
      commonMistake.id,
      'some title2',
      'some description2',
      true,
      superman,
      orgId
    );

    const prismaCommonMistake2 = await prisma.partReviewCommonMistake.findUnique({
      where: {
        id: commonMistake.id
      }
    });

    expect(prismaCommonMistake2?.title).toBe('some title2');
    expect(prismaCommonMistake2?.description).toBe('some description2');
    expect(prismaCommonMistake2?.starred).toBe(true);
    expect(prismaCommonMistake2?.userCreatedId).toBe(batman.userId);
    expect(prismaCommonMistake2?.organizationId).toBe(orgId);
    expect(prismaCommonMistake2?.dateDeleted).toBeFalsy();
    expect(updatedCommonMistake?.title).toBe('some title2');
    expect(updatedCommonMistake?.description).toBe('some description2');
    expect(updatedCommonMistake?.starred).toBe(true);

    const deletedCommonMistake = await PartReviewService.deleteCommonMistake(commonMistake.id, superman, orgId);
    expect(deletedCommonMistake?.title).toBe('some title2');
    expect(deletedCommonMistake?.description).toBe('some description2');
    expect(deletedCommonMistake?.starred).toBe(true);

    const prismaDeletedMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        id: commonMistake.id
      }
    });
    expect(prismaDeletedMistake?.dateDeleted).toBeTruthy();
  });

  it('does not let non-admins create, edit, or delete common mistakes', async () => {
    await expect(
      async () => await PartReviewService.createCommonMistake('some title', 'some description', false, nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('create common mistake'));

    const commonMistake = await PartReviewService.createCommonMistake(
      'some title',
      'some description',
      false,
      batman,
      orgId
    );

    await expect(
      async () =>
        await PartReviewService.updateCommonMistake(
          commonMistake.id,
          'some title2',
          'some description2',
          true,
          nonAdmin,
          orgId
        )
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update common mistake'));

    await expect(async () => await PartReviewService.deleteCommonMistake(commonMistake.id, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete common mistake')
    );
  });

  it('does not allow updating deleted common mistake', async () => {
    const commonMistake = await PartReviewService.createCommonMistake(
      'some title',
      'some description',
      false,
      batman,
      orgId
    );

    await PartReviewService.deleteCommonMistake(commonMistake.id, superman, orgId);

    await expect(
      async () =>
        await PartReviewService.updateCommonMistake(
          commonMistake.id,
          'some title2',
          'some description2',
          true,
          batman,
          orgId
        )
    ).rejects.toThrow(new DeletedException('common mistake', commonMistake.id));
  });
});
