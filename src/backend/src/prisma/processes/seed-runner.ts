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
    const maxNameLength = Math.max(...this.instances.map((i) => i.constructor.name.length));

    const mergeOutputs = (target: Record<string, any>, source: Record<string, any>, sourceName: string) => {
      const duplicateKeys = Object.keys(source).filter((key) => key in target);
      if (duplicateKeys.length > 0) {
        throw new Error(`Duplicate seed output keys from ${sourceName}: ${duplicateKeys.join(', ')}`);
      }
      return Object.assign(target, source);
    };

    const totalStart = Date.now();

    console.log();
    console.log(`  🌱 Starting seed — ${total} processes\n`);

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      instance.prisma = this.prisma;
      const start = Date.now();
      const index = `[${String(i + 1).padStart(String(total).length)}/${total}]`;
      const name = instance.constructor.name.padEnd(maxNameLength);

      const spinner = ora({
        text: `${index} ${name}`,
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

        const elapsed = `${((Date.now() - start) / 1000).toFixed(2)}s`;
        spinner.succeed(`${index} ${name}   ${elapsed}`);
      } catch (e) {
        const elapsed = `${((Date.now() - start) / 1000).toFixed(2)}s`;
        spinner.fail(`${index} ${name}   ${elapsed}`);
        const totalElapsed = `${((Date.now() - totalStart) / 1000).toFixed(2)}s`;
        console.log();
        console.log(`  ❌ Seed failed on ${instance.constructor.name.trim()} failure(s) in ${totalElapsed}`);
        console.log();
        throw e;
      }
    }

    const totalElapsed = `${((Date.now() - totalStart) / 1000).toFixed(2)}s`;
    console.log();
    console.log(`  ✅ Seed complete — ${total} processes finished in ${totalElapsed}`);
    console.log();

    return context;
  }
}
