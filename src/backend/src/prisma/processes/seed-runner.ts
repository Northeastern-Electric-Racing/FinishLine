import { PrismaClient } from '@prisma/client';
import { SeedProcess, GLOBAL_SEED } from './seed-process.js';
import { Twisters } from 'twisters';

type AnyProcess = SeedProcess<any, any>;

const DEFAULT_MAX_CONCURRENCY = 4;

const deriveSeed = (baseSeed: number, processName: string): number => {
  let hash = baseSeed >>> 0;
  for (let i = 0; i < processName.length; i++) {
    hash = (Math.imul(hash, 31) + processName.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export class SeedRunner {
  private instances: AnyProcess[] = [];
  private prisma!: PrismaClient;
  private baseSeed = GLOBAL_SEED;
  private maxConcurrency = DEFAULT_MAX_CONCURRENCY;

  withPrisma(prisma: PrismaClient) {
    this.prisma = prisma;
    return this;
  }

  withSeed(seed: number) {
    this.baseSeed = seed;
    return this;
  }

  withMaxConcurrency(max: number) {
    this.maxConcurrency = Math.max(1, max);
    return this;
  }

  register(...processes: AnyProcess[]) {
    this.instances.push(...processes);
    return this;
  }

  async run() {
    if (!this.prisma) throw new Error('SeedRunner requires a PrismaClient. Call withPrisma() before run().');

    const total = this.instances.length;
    const byName = new Map<string, AnyProcess>();
    for (const instance of this.instances) {
      const { name } = instance.constructor;
      if (byName.has(name)) throw new Error(`Duplicate process registered: ${name}`);
      byName.set(name, instance);
    }

    const dependencyNames = new Map<string, string[]>();
    for (const instance of this.instances) {
      const { name } = instance.constructor;
      const deps = instance.dependencies().map((depClass) => depClass.name);
      for (const dep of deps) {
        if (!byName.has(dep)) {
          throw new Error(`Process ${name} depends on ${dep}, which was not registered.`);
        }
      }
      dependencyNames.set(name, deps);
    }

    this.assertNoCycles(dependencyNames);

    const maxNameLength = Math.max(...this.instances.map((i) => i.constructor.name.length));
    const outputs = new Map<string, any>();
    const context: Record<string, any> = {};

    const mergeOutputs = (target: Record<string, any>, source: Record<string, any>, sourceName: string) => {
      const duplicateKeys = Object.keys(source).filter((key) => key in target);
      if (duplicateKeys.length > 0) {
        throw new Error(`Duplicate seed output keys from ${sourceName}: ${duplicateKeys.join(', ')}`);
      }
      return Object.assign(target, source);
    };

    const remaining = new Set(byName.keys());
    const inFlight = new Map<string, Promise<void>>();
    const completed = new Set<string>();
    const startTimes = new Map<string, number>();
    let launchedCount = 0;
    let failed: unknown = null;

    const totalStart = Date.now();
    const twisters = new Twisters();
    console.log();
    console.log(`  🌱 Starting seed — ${total} processes (max ${this.maxConcurrency} concurrent)\n`);

    const depsSatisfied = (name: string) => (dependencyNames.get(name) ?? []).every((dep) => completed.has(dep));

    const launch = (name: string) => {
      const instance = byName.get(name)!;
      remaining.delete(name);
      launchedCount += 1;
      const index = `[${String(launchedCount).padStart(String(total).length)}/${total}]`;
      const label = instance.constructor.name.padEnd(maxNameLength);

      twisters.put(name, { text: `  ${index} ${label}` });
      startTimes.set(name, Date.now());

      instance.prisma = this.prisma;
      instance.reseed(deriveSeed(this.baseSeed, name));

      const depOutputs = (dependencyNames.get(name) ?? []).reduce<Record<string, any>>((acc, depName) => {
        const output = outputs.get(depName);
        if (!output) throw new Error(`Missing output for dependency: ${depName}`);
        return mergeOutputs(acc, output, depName);
      }, {});

      const task = (async () => {
        const output = await instance.run(depOutputs);
        outputs.set(name, output);
        mergeOutputs(context, output, name);
      })()
        .then(() => {
          const elapsed = `${((Date.now() - startTimes.get(name)!) / 1000).toFixed(2)}s`;
          twisters.put(name, { active: false, text: `  ✔ ${index} ${label} ${elapsed}` });
          completed.add(name);
        })
        .catch((e) => {
          const elapsed = `${((Date.now() - startTimes.get(name)!) / 1000).toFixed(2)}s`;
          twisters.put(name, { active: false, text: `  ✖ ${index} ${label} ${elapsed}` });
          if (!failed) failed = e;
        })
        .finally(() => {
          inFlight.delete(name);
        });

      inFlight.set(name, task);
    };

    while ((remaining.size > 0 || inFlight.size > 0) && !failed) {
      const ready = [...remaining].filter(depsSatisfied);

      while (ready.length > 0 && inFlight.size < this.maxConcurrency) {
        launch(ready.shift()!);
      }

      if (inFlight.size === 0 && remaining.size > 0) {
        break;
      }

      if (inFlight.size > 0) {
        await Promise.race(inFlight.values());
      }
    }

    await Promise.allSettled(inFlight.values());

    twisters.forEachMessage((_message, messageName) => twisters.remove(messageName));
    twisters.flush();

    if (failed) {
      const totalElapsed = `${((Date.now() - totalStart) / 1000).toFixed(2)}s`;
      console.log();
      console.log(`  ❌ Seed failed in ${totalElapsed}`);
      console.log();
      throw failed;
    }

    if (completed.size < total) {
      const stuck = [...byName.keys()].filter((name) => !completed.has(name));
      throw new Error(`Seed could not complete. Unreachable processes (dependency issue): ${stuck.join(', ')}`);
    }

    const totalElapsed = `${((Date.now() - totalStart) / 1000).toFixed(2)}s`;
    console.log();
    console.log(`  ✅ Seed complete — ${total} processes finished in ${totalElapsed}`);
    console.log();

    return context;
  }

  private assertNoCycles(dependencyNames: Map<string, string[]>) {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const stack: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        const cycleStart = stack.indexOf(name);
        const cycle = [...stack.slice(cycleStart), name].join(' → ');
        throw new Error(`Dependency cycle detected: ${cycle}`);
      }
      visiting.add(name);
      stack.push(name);
      for (const dep of dependencyNames.get(name) ?? []) visit(dep);
      stack.pop();
      visiting.delete(name);
      visited.add(name);
    };

    for (const name of dependencyNames.keys()) visit(name);
  }
}
