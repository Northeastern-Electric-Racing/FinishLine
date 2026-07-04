import { PrismaClient } from '@prisma/client';
import { SeedProcess } from './seed-process.js';
import ora from 'ora';

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
    const total = this.instances.length;

    const mergeOutputs = (target: Record<string, any>, source: Record<string, any>, sourceName: string) => {
      const duplicateKeys = Object.keys(source).filter((key) => key in target);
      if (duplicateKeys.length > 0) {
        throw new Error(`Duplicate seed output keys from ${sourceName}: ${duplicateKeys.join(', ')}`);
      }
      return Object.assign(target, source);
    };

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      instance.prisma = this.prisma;
      const start = Date.now();

      const spinner = ora({
        text: `[${i + 1}/${total}] ${instance.constructor.name}...`,
        color: 'cyan'
      }).start();

      try {
        const depOutputs = instance.dependencies().reduce<Record<string, any>>((acc, depClass) => {
          const output = outputs.get(depClass.name);
          if (!output) throw new Error(`Missing output for dependency: ${depClass.name}`);
          return mergeOutputs(acc, output, depClass.name);
        }, {});

        const output = await instance.run(depOutputs);

        outputs.set(instance.constructor.name, output);
        mergeOutputs(context, output, instance.constructor.name);

        spinner.succeed(
          `[${i + 1}/${total}] ${instance.constructor.name} complete (${((Date.now() - start) / 1000).toFixed(2)}s)`
        );
      } catch (e) {
        spinner.fail(
          `[${i + 1}/${total}] ${instance.constructor.name} failed (${((Date.now() - start) / 1000).toFixed(2)}s)`
        );
        throw e;
      }
    }

    return context;
  }
}
