import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { DateRange } from '../context.js';

const CURRENT_YEAR = new Date().getFullYear();
const CAR_COUNT = 5;

const FROM_MONTH = 1; // April
const FROM_DAY = 1;
const TO_MONTH = 12; // September
const TO_DAY = 30;

export const getCarConfigs = (faker: Faker) => {
  return Array.from({ length: CAR_COUNT }, (_, i) => {
    const carYear = CURRENT_YEAR - (CAR_COUNT - 1) + i + 1;
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
