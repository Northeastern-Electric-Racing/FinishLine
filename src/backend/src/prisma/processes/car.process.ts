import { Prisma } from '@prisma/client';
import { SeedProcess } from './seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { base, en, Faker } from '@faker-js/faker';

export type DateRange = {
  start: Date;
  end: Date;
};

export type CarContext = {
  car: Prisma.CarGetPayload<{ include: { wbsElement: true } }>;
  year: number;
  dateRange: DateRange;
};

export type CarOutput = {
  cars: CarContext[];
  currentYearCar: CarContext;
};

const CURRENT_YEAR = new Date().getFullYear();
const CAR_COUNT = 5;

const FROM_MONTH = 3
const FROM_DAY = 1

const TO_MONTH = 8
const TO_DAY = 31

const CAR_CONFIGS = Array.from({ length: CAR_COUNT }, (_, i) => {
  const carYear = CURRENT_YEAR - (CAR_COUNT - 1) + i;
  const shortYear = String(carYear).slice(2);

  // seed faker per car so dates are reproducible
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

  console.log(`NER-${shortYear} starts ${start} and ends ${end}`);

  return {
    name: `NER-${shortYear}`,
    carNumber: carYear - 2000,
    year: carYear,
    dateRange: { start, end }
  };
});

export class CarProcess extends SeedProcess<OrganizationOutput, CarOutput> {
  dependencies() {
    return [OrganizationProcess];
  }

  async run({ organization }: OrganizationOutput): Promise<CarOutput> {
    const { organizationId } = organization;

    const cars: CarContext[] = await Promise.all(
      CAR_CONFIGS.map(async ({ name, carNumber, year }) => {
        const dateRange: DateRange = {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31)
        };

        const car = await this.prisma.car.create({
          data: {
            wbsElement: {
              create: {
                name,
                carNumber,
                projectNumber: 0,
                workPackageNumber: 0,
                organizationId
              }
            }
          },
          include: { wbsElement: true }
        });

        return { car, year, dateRange };
      })
    );

    const currentYearCar = cars.find((car) => car.year === CURRENT_YEAR)!;

    return { cars, currentYearCar };
  }
}
