import { PrismaClient } from '@prisma/client';
import { SeedProcess, GLOBAL_SEED } from './seed-process.js';

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
    if (!this.prisma) throw new Error('SeedRunner requires a PrismaClient. Call withPrisma() before run().');

    const outputs = new Map<string, any>();
    const context: Record<string, any> = {};

    for (const instance of this.instances) {
      instance.prisma = this.prisma;

      const depOutputs = instance.dependencies().reduce((acc, depClass) => {
        const output = outputs.get(depClass.name);
        if (!output) throw new Error(`Missing output for dependency: ${depClass.name}`);
        return { ...acc, ...output };
      }, {});

      console.log(`Running ${instance.constructor.name} (seed ${GLOBAL_SEED})...`);
      const output = await instance.run(depOutputs);

      outputs.set(instance.constructor.name, output);
      Object.assign(context, output);

      console.log(`${instance.constructor.name} complete`);
    }

    return context;
  }
}
