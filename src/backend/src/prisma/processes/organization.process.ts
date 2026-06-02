// processes/organization.process.ts
import { Organization, Theme } from '@prisma/client';
import { SeedProcess } from './seed-process.js';

export type OrganizationOutput = {
  organization: Organization;
  bootstrapUserId: string;
};

export class OrganizationProcess extends SeedProcess<{}, OrganizationOutput> {
  dependencies() {
    return [];
  }

  async run(_deps: {}): Promise<OrganizationOutput> {
    const bootstrap = await this.prisma.user.create({
      data: {
        firstName: this.faker.person.firstName(),
        lastName: this.faker.person.lastName(),
        googleAuthId: 'bootstrap-admin',
        email: 'admin@bootstrap.com',
        emailId: 'admin',
        userSettings: {
          create: { defaultTheme: Theme.DARK, slackId: 'admin' }
        }
      }
    });

    const organization = await this.prisma.organization.create({
      data: {
        name: 'Northeastern Electric Racing',
        description: 'Student-run electric racing organization at Northeastern University.',
        userCreatedId: bootstrap.userId
      }
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
