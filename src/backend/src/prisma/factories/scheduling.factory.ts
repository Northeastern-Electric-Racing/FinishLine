import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { seedConfig } from '../seed-config.js';

export const scheduleSettingsCreateInput = (faker: Faker, userId: string): Prisma.Schedule_SettingsCreateInput => ({
  personalGmail: faker.internet.email({ provider: 'gmail.com' }),
  personalZoomLink: `https://zoom.us/j/${faker.string.numeric(10)}`,
  User: { connect: { userId } }
});

export const availabilityCreateInput = (
  faker: Faker,
  scheduleSettingsId: string,
  date: Date
): Prisma.AvailabilityCreateInput => {
  const dayOfWeek = date.getUTCDay();

  const {
    hoursPerDay,
    availabilityBlocks: { weekend, weekday }
  } = seedConfig.scheduling;

  const availabilityRange = dayOfWeek === 0 || dayOfWeek === 6 ? weekend : weekday;

  return {
    availability: faker.helpers.arrayElements(
      Array.from({ length: hoursPerDay }, (_, i) => i),
      {
        min: availabilityRange.min,
        max: availabilityRange.max
      }
    ),
    dateSet: date,
    scheduleSettings: {
      connect: { drScheduleSettingsId: scheduleSettingsId }
    }
  };
};
