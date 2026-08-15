import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { DateRange } from '../context.js';
import { seedConfig } from '../seed-config.js';

const CURRENT_YEAR = new Date().getFullYear();

export const getCarConfigs = (faker: Faker) => {
  const {
    carCount,
    seasonWindow: { fromMonth, fromDay, toMonth, toDay }
  } = seedConfig.car;

  return Array.from({ length: carCount }, (_, i) => {
    const carYear = CURRENT_YEAR - (carCount - 1) + i + 1;
    const shortYear = String(carYear).slice(2);

    const start = faker.date.between({
      from: new Date(carYear - 1, fromMonth, fromDay),
      to: new Date(carYear - 1, toMonth, toDay)
    });

    const end = faker.date.between({
      from: new Date(carYear, fromMonth, fromDay),
      to: new Date(carYear, toMonth, toDay)
    });

    return {
      name: `NER-${shortYear}`,
      carNumber: i,
      year: carYear,
      dateRange: { start, end } as DateRange
    };
  });
};

export const carCreateInput = (name: string, carNumber: number, organizationId: string): Prisma.CarCreateInput => ({
  wbsElement: {
    create: {
      name,
      carNumber,
      projectNumber: 0,
      workPackageNumber: 0,
      organizationId
    }
  }
});
