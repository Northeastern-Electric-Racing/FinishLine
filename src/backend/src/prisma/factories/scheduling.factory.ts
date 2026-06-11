import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';

export const scheduleSettingsCreateInput = (faker: Faker, userId: string): Prisma.Schedule_SettingsCreateInput => ({
  personalGmail: faker.internet.email({ provider: 'gmail.com' }),
  personalZoomLink: `https://zoom.us/j/${faker.string.numeric(10)}`,
  User: { connect: { userId } }
});

const AVAILABILITY_OVER_WEEKENDS = {
  min: 0,
  max: 4
};

const AVAILABILITY_GENERAL = {
  min: 4,
  max: 10
};

export const availabilityCreateInput = (
  faker: Faker,
  scheduleSettingsId: string,
  date: Date
): Prisma.AvailabilityCreateInput => {
  const dayOfWeek = date.getDay();
  const availability = dayOfWeek === 0 || dayOfWeek === 6 ? AVAILABILITY_OVER_WEEKENDS : AVAILABILITY_GENERAL;
  return {
    availability: faker.helpers.arrayElements(
      Array.from({ length: 12 }, (_, i) => i),
      { min: availability.min, max: availability.max }
    ),
    dateSet: date,
    scheduleSettings: { connect: { drScheduleSettingsId: scheduleSettingsId } }
  };
};
