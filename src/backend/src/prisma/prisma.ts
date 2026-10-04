import { PrismaClient } from '@prisma/client';
import { getCurrentRequestRoute } from '../utils/request-context.utils.js';
import { ms } from 'zod/v4/locales';

const SLOW_QUERY_THRESHOLD = 300;
// results with more objects/array entries than this get logged (typical queries are well under 5,000;
// the heaviest endpoints we've measured return 80,000-250,000)
const LARGE_RESULT_NODE_THRESHOLD = 20_000;
// stop counting past this so checking a huge result stays cheap
const NODE_COUNT_CAP = 1_000_000;

/**
 * Counts the objects and array entries in a query result, as a cheap proxy for how much memory it takes
 * (unlike JSON.stringify, this doesn't allocate a second copy of the result)
 * @param value the query result
 * @returns the number of objects and array entries, capped at NODE_COUNT_CAP
 */
const countResultNodes = (value: unknown): number => {
  let count = 0;
  const stack: unknown[] = [value];

  while (stack.length > 0 && count < NODE_COUNT_CAP) {
    const current = stack.pop();
    // skip primitives, dates, and binary data (Bytes columns) - only count containers
    if (current === null || typeof current !== 'object' || current instanceof Date || ArrayBuffer.isView(current)) {
      continue;
    }
    count++;
    const children = Array.isArray(current) ? current : Object.values(current);
    for (const child of children) {
      stack.push(child);
    }
  }

  return count;
};

interface QueryLoggerExtension {
  name: string;
  query: {
    $allOperations(params: {
      operation: string;
      model?: string;
      args: any;
      query: (args: any) => Promise<any>;
    }): Promise<any>;
  };
}

// extension to track query times and log slow queries and large results
const queryLoggerExtension: QueryLoggerExtension = {
  name: 'queryLogger',
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = performance.now();

      const result = await query(args);
      const duration = performance.now() - start;
      const nodes = countResultNodes(result);

      const isSlowQuery = duration > SLOW_QUERY_THRESHOLD;
      const isLargeResult = nodes > LARGE_RESULT_NODE_THRESHOLD;

      if (isSlowQuery || isLargeResult) {
        let msg = isSlowQuery ? '‼️  Slow Prisma Query:' : '‼️  Large Prisma Result:';
        if (isSlowQuery && isLargeResult) {
          msg = '‼️  Slow and Large Prisma Query:';
        }
        console.warn(
          JSON.stringify({
            msg,
            model,
            operation,
            durationMs: Math.round(duration),
            nodes,
            route: getCurrentRequestRoute()
          })
        );
      }

      return result;
    }
  }
};

const baseClient = new PrismaClient({
  log: ['warn', 'error']
});

const prisma = baseClient.$extends(queryLoggerExtension);

export default prisma;
