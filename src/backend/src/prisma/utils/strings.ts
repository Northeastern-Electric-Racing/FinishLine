import { Faker } from '@faker-js/faker';

export const generateLoremIpsum = (faker: Faker, maxSentences: number): string =>
  faker.lorem.sentences(faker.number.int({ min: 1, max: maxSentences }));
