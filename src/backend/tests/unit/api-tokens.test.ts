import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { batmanAppAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { AccessDeniedGuestException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';
import ApiTokenService from '../../src/services/api-tokens.services.js';
import { hashApiToken } from '../../src/utils/api-tokens.utils.js';

describe('Api Token Tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Generate Api Token', () => {
    it('fails if the user is a guest', async () => {
      const guest = await createTestUser(theVisitorGuest, orgId);

      await expect(async () => await ApiTokenService.generateApiToken(guest, organization)).rejects.toThrow(
        new AccessDeniedGuestException('generate an API token')
      );
    });

    it('stores only the hash and returns the raw token once', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);

      const generated = await ApiTokenService.generateApiToken(batman, organization);

      expect(generated.token.startsWith('fl_')).toBe(true);
      expect(generated.preview).toBe(generated.token.slice(-4));

      const stored = await prisma.user_API_Token.findUnique({ where: { apiTokenId: generated.apiTokenId } });

      expect(stored).not.toBeNull();
      expect(stored?.tokenHash).toBe(hashApiToken(generated.token));
      // the raw token must never be persisted anywhere on the row
      expect(JSON.stringify(stored)).not.toContain(generated.token);
    });

    it('revokes the previous token when regenerating', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);

      const first = await ApiTokenService.generateApiToken(batman, organization);
      const second = await ApiTokenService.generateApiToken(batman, organization);

      const oldToken = await prisma.user_API_Token.findUnique({ where: { apiTokenId: first.apiTokenId } });
      const newToken = await prisma.user_API_Token.findUnique({ where: { apiTokenId: second.apiTokenId } });

      expect(oldToken?.dateRevoked).not.toBeNull();
      expect(newToken?.dateRevoked).toBeNull();
      expect(first.token).not.toBe(second.token);

      const active = await prisma.user_API_Token.findMany({ where: { userId: batman.userId, dateRevoked: null } });
      expect(active).toHaveLength(1);
    });
  });

  describe('Get Current User Api Token', () => {
    it('returns null when the user has never generated one', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);

      expect(await ApiTokenService.getCurrentUserApiToken(batman)).toBeNull();
    });

    it('returns metadata without the raw token', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const generated = await ApiTokenService.generateApiToken(batman, organization);

      const metadata = await ApiTokenService.getCurrentUserApiToken(batman);

      expect(metadata?.apiTokenId).toBe(generated.apiTokenId);
      expect(metadata?.preview).toBe(generated.preview);
      expect(metadata).not.toHaveProperty('token');
    });

    it('returns null after the only token is revoked', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const generated = await ApiTokenService.generateApiToken(batman, organization);

      await prisma.user_API_Token.update({
        where: { apiTokenId: generated.apiTokenId },
        data: { dateRevoked: new Date() }
      });

      expect(await ApiTokenService.getCurrentUserApiToken(batman)).toBeNull();
    });
  });
});
