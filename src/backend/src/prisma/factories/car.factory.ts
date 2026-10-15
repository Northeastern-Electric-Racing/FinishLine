import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { DateRange } from '../context.js';
import { seedConfig } from '../seed-config.js';

const FROM_MONTH = 5; // May
const FROM_DAY = 1;
const TO_MONTH = 7; // July
const TO_DAY = 31;

// Built in UTC on purpose: a local-time boundary would put CI (UTC) and a dev machine on
// different sides of a car's date range and generate different data from the same seed.
const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));

export const getCarConfigs = (faker: Faker, now: Date) => {
  const currentYear = now.getUTCFullYear();

  return Array.from({ length: seedConfig.car.carCount }, (_, i) => {
    const carYear = currentYear - (seedConfig.car.carCount - 1) + i + 1;
    const shortYear = String(carYear).slice(2);

    const start = faker.date.between({
      from: utc(carYear - 1, FROM_MONTH, FROM_DAY),
      to: utc(carYear - 1, TO_MONTH, TO_DAY)
    });

    const end = faker.date.between({
      from: utc(carYear, FROM_MONTH, FROM_DAY),
      to: utc(carYear, TO_MONTH, TO_DAY)
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
