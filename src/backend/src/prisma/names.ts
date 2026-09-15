import { Faker } from '@faker-js/faker';

/*
  https://fakerjs.dev/api/person.html
*/

interface WithFaker {
  faker: Faker;
}

export function getName({ faker }: WithFaker) {
  return faker.person.fullName();
}
