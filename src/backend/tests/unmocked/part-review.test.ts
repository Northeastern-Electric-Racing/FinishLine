import { Organization, User } from '@prisma/client';
import { createTestChecklist, createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
import PartReviewService from '../../src/services/part-review.service.ts';
import { batmanAppAdmin, supermanAdmin } from '../test-data/users.test-data.ts';
import prisma from '../../src/prisma/prisma.ts';

describe('part review common mistakes create update and delete', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
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
});
