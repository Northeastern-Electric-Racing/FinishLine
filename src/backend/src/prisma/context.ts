import { Prisma } from '@prisma/client';

// Car Context
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
