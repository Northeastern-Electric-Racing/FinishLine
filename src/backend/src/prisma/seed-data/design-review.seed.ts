import { Prisma } from '@prisma/client';
import { DesignReviewStatus } from 'shared';

const batteryDesign: Prisma.Design_ReviewCreateInput = {
  dateScheduled: new Date('03/19/2024'),
  status: DesignReviewStatus.CONFIRMED,
  isOnline: true,
  isInPerson: false,
  userCreated: {
    create: {
      firstName: 'Bruce',
      lastName: 'Wayne',
      googleAuthId: 'im batman',
      email: 'notbatman@brucewayne.com'
    }
  },
  teamType: {
    create: {
      teamTypeId: 'team 1',
      name: 'some name',
      iconName: 'warning icon'
    }
  },
  wbsElement: {
    create: {
      carNumber: 1,
      projectNumber: 2,
      workPackageNumber: 1,
      name: 'fix the batteries'
    }
  }
};

export const dbSeedAllDesignReviews = { batteryDesign };
