import { Organization } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import {
  BOOTSTRAP_GOOGLE_AUTH_ID,
  bootstrapUserCreateInput,
  organizationCreateInput
} from '../factories/organization.factory.js';

export type OrganizationOutput = {
  organization: Organization;
  bootstrapUserId: string;
};

export class OrganizationProcess extends SeedProcess<{}, OrganizationOutput> {
  dependencies() {
    return [];
  }

  async run(_deps: {}): Promise<OrganizationOutput> {
    const bootstrap = await this.prisma.user.upsert({
      where: { googleAuthId: BOOTSTRAP_GOOGLE_AUTH_ID },
      update: {},
      create: bootstrapUserCreateInput()
    });

    const organization = await this.prisma.organization.create({
      data: organizationCreateInput(bootstrap.userId)
    });

    await this.prisma.user.update({
      where: { userId: bootstrap.userId },
      data: {
        organizations: { connect: { organizationId: organization.organizationId } },
        roles: { create: { roleType: 'APP_ADMIN', organizationId: organization.organizationId } }
      }
    });

    return { organization, bootstrapUserId: bootstrap.userId };
  }
}
