import { Prisma, Theme } from '@prisma/client';

export const BOOTSTRAP_GOOGLE_AUTH_ID = 'thomas-emrax';
export const BOOTSTRAP_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001';

export const bootstrapUserCreateInput = (): Prisma.UserCreateInput => ({
  userId: BOOTSTRAP_USER_ID,
  firstName: 'Thomas',
  lastName: 'Emrax',
  googleAuthId: BOOTSTRAP_GOOGLE_AUTH_ID,
  email: 'admin@bootstrap.com',
  emailId: 'admin',
  userSettings: {
    create: { defaultTheme: Theme.DARK, slackId: 'admin' }
  }
});

export const organizationCreateInput = (userCreatedId: string): Prisma.OrganizationCreateInput => ({
  name: 'Northeastern Electric Racing',
  description:
    'Northeastern Electric Racing is a student-run organization at Northeastern University building all-electric formula-style race cars from scratch to compete in Formula Hybrid + Electric Formula SAE (FSAE).',
  applicationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeCvG7GqmZm_gmSZiahbVTW9ZFpEWG0YfGQbkSB_whhHzxXpA/closedform',
  platformDescription:
    'Finishline is a Project Management Dashboard developed by the Software Team at Northeastern Electric Racing.',
  platformLogoImageId: '1auQO3GYydZOo1-vCn0D2iyCfaxaVFssx',
  onboardingText:
    'Thank you for applying to Northeastern Electric Racing! After reviewing your application, we are very excited to officially welcome you to our team.',
  userCreated: {
    connect: { userId: userCreatedId }
  }
});
