import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { DateRange } from '../context.js';
import { seedConfig } from '../seed-config.js';

const CURRENT_YEAR = new Date().getFullYear();

const FROM_MONTH = 5; // May
const FROM_DAY = 1;
const TO_MONTH = 7; // July
const TO_DAY = 31;

export const getCarConfigs = (faker: Faker) => {
  return Array.from({ length: seedConfig.car.carCount }, (_, i) => {
    const carYear = CURRENT_YEAR - (seedConfig.car.carCount - 1) + i + 1;
    const shortYear = String(carYear).slice(2);

    const start = faker.date.between({
      from: new Date(carYear - 1, FROM_MONTH, FROM_DAY),
      to: new Date(carYear - 1, TO_MONTH, TO_DAY)
    });

    const end = faker.date.between({
      from: new Date(carYear, FROM_MONTH, FROM_DAY),
      to: new Date(carYear, TO_MONTH, TO_DAY)
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
