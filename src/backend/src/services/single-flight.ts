import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map to track in-flight queries
const inFlight = new Map<string, Promise<any>>();

function stableKey(model: string, method: string, args: any): string {
  return `${model}.${method}:${JSON.stringify(args)}`;
}

async function singleFlight<T>(model: keyof PrismaClient, method: string, args: any): Promise<T> {
  const key = stableKey(model as string, method, args);

  if (inFlight.has(key)) {
    // return existing promise
    return inFlight.get(key) as Promise<T>;
  }

  const promise = (prisma[model] as any)[method](args).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);

  return promise;
}

export default singleFlight;
