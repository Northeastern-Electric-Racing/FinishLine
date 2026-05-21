import { Faker, en, base } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export type SeedProcessConstructor<TInput, TOutput> = new (...args: any[]) => SeedProcess<TInput, TOutput>;

export abstract class SeedProcess<TInput, TOutput> {
  protected faker: Faker;
  public prisma!: PrismaClient;
  private static _nextSeed = 1;
  readonly seed: number;

  constructor() {
    this.seed = SeedProcess._nextSeed++;
    this.faker = new Faker({ locale: [en, base] });
    this.faker.seed(this.seed);
  }

  abstract dependencies(): SeedProcessConstructor<any, any>[];
  abstract run(deps: TInput): Promise<TOutput>;
}
