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

    const mergeOutputs = (target: Record<string, any>, source: Record<string, any>, sourceName: string) => {
      const duplicateKeys = Object.keys(source).filter((key) => key in target);

      if (duplicateKeys.length > 0) {
        throw new Error(`Duplicate seed output keys from ${sourceName}: ${duplicateKeys.join(', ')}`);
      }

      return Object.assign(target, source);
    };

    for (const instance of this.instances) {
      instance.prisma = this.prisma;

      const depOutputs = instance.dependencies().reduce<Record<string, any>>((acc, depClass) => {
        const output = outputs.get(depClass.name);
        if (!output) throw new Error(`Missing output for dependency: ${depClass.name}`);

        return mergeOutputs(acc, output, depClass.name);
      }, {});

      console.log(`Running ${instance.constructor.name} (seed ${GLOBAL_SEED})...`);
      const output = await instance.run(depOutputs);

      outputs.set(instance.constructor.name, output);
      mergeOutputs(context, output, instance.constructor.name);

      console.log(`${instance.constructor.name} complete`);
    }

    return context;
  }
}
