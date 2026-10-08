import { Faker, en, base } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export type SeedProcessConstructor<TInput, TOutput> = new (...args: any[]) => SeedProcess<TInput, TOutput>;

export const GLOBAL_SEED = 1;

export abstract class SeedProcess<TInput, TOutput> {
  public faker: Faker;
  public prisma!: PrismaClient;
  /** The instant this run treats as "now" -- see seed-time.ts. Never read the clock directly. */
  public now!: Date;

  constructor() {
    this.faker = new Faker({ locale: [en, base] });
    this.faker.seed(GLOBAL_SEED);
  }

  reseed(seed: number) {
    this.faker.seed(seed);
  }

  abstract dependencies(): SeedProcessConstructor<any, any>[];
  abstract run(deps: TInput): Promise<TOutput>;
}
