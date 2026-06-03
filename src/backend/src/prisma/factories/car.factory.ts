import { Prisma } from '@prisma/client';
import { base, en, Faker } from '@faker-js/faker';
import { DateRange } from '../context.js';

const CURRENT_YEAR = new Date().getFullYear();
const CAR_COUNT = 5;

const FROM_MONTH = 3; // April
const FROM_DAY = 1;
const TO_MONTH = 8; // September
const TO_DAY = 31;

export const CAR_CONFIGS = Array.from({ length: CAR_COUNT }, (_, i) => {
  const carYear = CURRENT_YEAR - (CAR_COUNT - 1) + i;
  const shortYear = String(carYear).slice(2);

  const carFaker = new Faker({ locale: [en, base] });
  carFaker.seed(carYear);

  const start = carFaker.date.between({
    from: new Date(carYear - 1, FROM_MONTH, FROM_DAY),
    to: new Date(carYear - 1, TO_MONTH, TO_DAY)
  });

  const end = carFaker.date.between({
    from: new Date(carYear, FROM_MONTH, FROM_DAY),
    to: new Date(carYear, TO_MONTH, TO_DAY)
  });

  return {
    name: `NER-${shortYear}`,
    carNumber: carYear - 2000,
    year: carYear,
    dateRange: { start, end } as DateRange
  };
});

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
