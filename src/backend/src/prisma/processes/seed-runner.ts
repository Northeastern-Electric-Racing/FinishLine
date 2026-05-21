import { PrismaClient } from '@prisma/client';
import { SeedProcess } from './seed-process.js';

export class SeedRunner {
  private instances: SeedProcess<any, any>[] = [];
  private prisma!: PrismaClient;

  withPrisma(prisma: PrismaClient) {
    this.prisma = prisma;
    return this;
  }

  register(...processes: SeedProcess<any, any>[]) {
    this.instances.push(...processes);
    return this;
  }

  async run() {
    if (!this.prisma) {
      throw new Error('No PrismaClient provided. Call .withPrisma(prisma) before .run()');
    }

    for (const instance of this.instances) {
      instance.prisma = this.prisma;
      console.log(`Running ${instance.constructor.name} (seed ${instance.seed})...`);
      await instance.run({});
      console.log(`${instance.constructor.name} complete`);
    }
  }
}
