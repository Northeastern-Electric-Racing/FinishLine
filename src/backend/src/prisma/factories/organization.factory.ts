// factories/organization.factory.ts
import { Prisma, Theme } from '@prisma/client';

export const bootstrapUserCreateInput = (): Prisma.UserCreateInput => ({
  firstName: 'Thomas',
  lastName: 'Emrax',
  googleAuthId: 'thomas-emrax',
  email: 'emrax.t@husky.neu.edu',
  emailId: 'emrax.t',
  userSettings: {
    create: { defaultTheme: Theme.DARK, slackId: 'emrax.t' }
  }
});

export const organizationCreateInput = (userCreatedId: string): Prisma.OrganizationCreateInput => ({
  name: 'Northeastern Electric Racing',
  description: 'Student-run electric racing organization at Northeastern University.',
  userCreated: { connect: { userId: userCreatedId } }
});
