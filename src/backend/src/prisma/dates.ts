import { Faker } from '@faker-js/faker';
/*
  https://fakerjs.dev/api/date.html
*/

interface WithFaker {
  faker: Faker;
}

export function generateRandomDate({ faker }: WithFaker, from?: Date, to?: Date) {
  return faker.date.between({ from: from ?? '2000-01-01', to: to ?? Date.now() });
}

export function generateRandomDateAround({ faker }: WithFaker, date: Date) {
  return faker.date.recent({ days: 5, refDate: date });
}
