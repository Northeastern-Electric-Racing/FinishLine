import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import PartReviewService from '../../src/services/part-review.services';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException } from '../../src/utils/errors.utils';

describe('part review tests', () => {
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

  it('creates a faq, edits it, and deletes it', async () => {
    const faq = await PartReviewService.createFaq('some question', 'some answer', batman, orgId);
    const prismaFaq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });

    expect(prismaFaq?.question).toBe('some question');
    expect(prismaFaq?.answer).toBe('some answer');
    expect(prismaFaq?.userCreatedId).toBe(batman.userId);
    expect(prismaFaq?.partReviewFaqOrgId).toBe(orgId);
    expect(prismaFaq?.regularFaqOrgId).toBeFalsy();
    expect(faq?.question).toBe('some question');
    expect(faq?.answer).toBe('some answer');

    const updatedFaq = await PartReviewService.updateFaq(
      faq.faqId,
      'some other question',
      'some other answer',
      superman,
      orgId
    );

    const prismaFaq2 = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });

    expect(prismaFaq2?.question).toBe('some other question');
    expect(prismaFaq2?.answer).toBe('some other answer');
    expect(prismaFaq2?.userCreatedId).toBe(batman.userId);
    expect(prismaFaq2?.partReviewFaqOrgId).toBe(orgId);
    expect(prismaFaq2?.dateDeleted).toBeFalsy();
    expect(updatedFaq?.question).toBe('some other question');
    expect(updatedFaq?.answer).toBe('some other answer');

    const deletedFaq = await PartReviewService.deleteFaq(faq.faqId, superman, orgId);
    expect(deletedFaq?.question).toBe('some other question');
    expect(deletedFaq?.answer).toBe('some other answer');

    const prismaDeletedFaq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });
    expect(prismaDeletedFaq?.dateDeleted).toBeTruthy();
  });

  it('does not let non-admins create, edit, or delete faqs', async () => {
    await expect(
      async () => await PartReviewService.createFaq('some question', 'some answer', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('create part review faq'));

    const faq = await PartReviewService.createFaq('some question', 'some answer', batman, orgId);

    await expect(
      async () => await PartReviewService.updateFaq(faq.faqId, 'some title2', 'some description2', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update faq'));

    await expect(async () => await PartReviewService.deleteFaq(faq.faqId, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete faq')
    );
  });

  it('does not allow updating deleted faqs', async () => {
    const faq = await PartReviewService.createFaq('some q', 'some a', batman, orgId);

    await PartReviewService.deleteFaq(faq.faqId, superman, orgId);

    await expect(
      async () => await PartReviewService.updateFaq(faq.faqId, 'some q2', 'some a2', batman, orgId)
    ).rejects.toThrow(new DeletedException('Faq', faq.faqId));
  });
});
