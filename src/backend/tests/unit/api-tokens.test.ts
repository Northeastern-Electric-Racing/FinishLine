import { vi } from 'vitest';
import { Organization, Role_Type } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import {
  batmanAppAdmin,
  member,
  supermanAdmin,
  supermanSettings,
  theVisitorGuest,
  wonderwomanGuest,
  wonderwomanSettings
} from '../test-data/users.test-data.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  HttpException
} from '../../src/utils/errors.utils.js';
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

  describe('Authenticate Api Token', () => {
    it('resolves the token to its user and their only organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const { token } = await ApiTokenService.generateApiToken(batman, organization);

      const { user, organization: resolved } = await ApiTokenService.authenticateApiToken(token, undefined);

      expect(user.userId).toBe(batman.userId);
      expect(resolved.organizationId).toBe(orgId);
    });

    it('uses the organization id when one is given', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const { token } = await ApiTokenService.generateApiToken(batman, organization);

      const { organization: resolved } = await ApiTokenService.authenticateApiToken(token, orgId);

      expect(resolved.organizationId).toBe(orgId);
    });

    it('fails without a token', async () => {
      await expect(ApiTokenService.authenticateApiToken(undefined, undefined)).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: No API token provided!')
      );
    });

    it('fails for a revoked token', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const generated = await ApiTokenService.generateApiToken(batman, organization);
      await prisma.user_API_Token.update({
        where: { apiTokenId: generated.apiTokenId },
        data: { dateRevoked: new Date() }
      });

      await expect(ApiTokenService.authenticateApiToken(generated.token, undefined)).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: Invalid API token!')
      );
    });

    it('fails once the user has been demoted to guest', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const { token } = await ApiTokenService.generateApiToken(batman, organization);
      await prisma.role.update({
        where: { uniqueRole: { userId: batman.userId, organizationId: orgId } },
        data: { roleType: Role_Type.GUEST }
      });

      await expect(ApiTokenService.authenticateApiToken(token, undefined)).rejects.toThrow(
        new AccessDeniedException('guests cannot use the API')
      );
    });
  });

  describe('Organization Api Token', () => {
    it('fails to generate for a non-admin', async () => {
      const regularMember = await createTestUser(member, orgId);

      await expect(ApiTokenService.generateOrganizationApiToken(regularMember, organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('generate an organization API token')
      );
    });

    it('fails to check for a non-admin', async () => {
      const regularMember = await createTestUser(member, orgId);

      await expect(ApiTokenService.hasOrganizationApiToken(regularMember, organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('view the organization API token')
      );
    });

    it('stores only the hash and reports that a token exists', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);

      expect(await ApiTokenService.hasOrganizationApiToken(batman, organization)).toBe(false);

      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      expect(token.startsWith('flb_')).toBe(true);
      const stored = await prisma.organization.findUnique({ where: { organizationId: orgId } });
      expect(stored?.apiTokenHash).toBe(hashApiToken(token));
      expect(await ApiTokenService.hasOrganizationApiToken(batman, organization)).toBe(true);
    });
  });

  describe('Authenticate On Behalf Of A Slack User', () => {
    it('resolves the organization token to the member linked to the slack id', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const superman = await createTestUser(supermanAdmin, orgId, supermanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      const { user, organization: resolved } = await ApiTokenService.authenticateApiToken(
        token,
        undefined,
        supermanSettings.slackId
      );

      expect(user.userId).toBe(superman.userId);
      expect(resolved.organizationId).toBe(orgId);
    });

    it('keeps working after the admin who generated it is demoted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const superman = await createTestUser(supermanAdmin, orgId, supermanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);
      await prisma.role.update({
        where: { uniqueRole: { userId: batman.userId, organizationId: orgId } },
        data: { roleType: Role_Type.GUEST }
      });

      const { user } = await ApiTokenService.authenticateApiToken(token, undefined, supermanSettings.slackId);

      expect(user.userId).toBe(superman.userId);
    });

    it('rejects a personal admin token that sends a slack id', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await createTestUser(supermanAdmin, orgId, supermanSettings);
      const { token } = await ApiTokenService.generateApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, undefined, supermanSettings.slackId)).rejects.toThrow(
        new AccessDeniedException('only the organization API token can act on behalf of a Slack user')
      );
    });

    it('rejects the organization token without a slack id', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, undefined)).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: Organization API tokens must act on behalf of a Slack user!')
      );
    });

    it('rejects the old organization token once it is regenerated', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await createTestUser(supermanAdmin, orgId, supermanSettings);
      const first = await ApiTokenService.generateOrganizationApiToken(batman, organization);
      await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(first, undefined, supermanSettings.slackId)).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: Invalid API token!')
      );
    });

    it('rejects an organization id header for a different organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await createTestUser(supermanAdmin, orgId, supermanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(
        ApiTokenService.authenticateApiToken(token, 'some-other-org-id', supermanSettings.slackId)
      ).rejects.toThrow(new AccessDeniedException('this API token belongs to a different organization'));
    });

    it('fails when no user in the organization has the slack id', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, undefined, 'unknownSlackId')).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: No user in this organization is linked to that Slack id!')
      );
    });

    it('fails when the slack user belongs to a different organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      // created inline rather than with createTestOrganization, which always uses the same unique creator and slug
      const otherOrganization = await prisma.organization.create({
        data: {
          name: 'Other Org',
          slug: 'other-org',
          description: 'A second organization',
          applicationLink: '',
          userCreated: { connect: { userId: batman.userId } }
        }
      });
      await createTestUser(supermanAdmin, otherOrganization.organizationId, supermanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, orgId, supermanSettings.slackId)).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: No user in this organization is linked to that Slack id!')
      );
    });

    it('fails for a blank slack id', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, undefined, '  ')).rejects.toThrow(
        new HttpException(401, 'Authentication Failed: Empty Slack user id!')
      );
    });

    it('fails when the slack user is a guest', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await createTestUser(wonderwomanGuest, orgId, wonderwomanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);

      await expect(ApiTokenService.authenticateApiToken(token, undefined, wonderwomanSettings.slackId)).rejects.toThrow(
        new AccessDeniedException('guests cannot use the API')
      );
    });

    it('logs who is being impersonated', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const superman = await createTestUser(supermanAdmin, orgId, supermanSettings);
      const token = await ApiTokenService.generateOrganizationApiToken(batman, organization);
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await ApiTokenService.authenticateApiToken(token, undefined, supermanSettings.slackId);

      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining(orgId));
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining(superman.userId));
      infoSpy.mockRestore();
    });
  });
});
