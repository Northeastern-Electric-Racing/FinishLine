import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const SLOW_QUERY_THRESHOLD = 300;

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

// extension to track query times and log slow queries in development
const queryLoggerExtension: QueryLoggerExtension = {
  name: 'queryLogger',
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = performance.now();

      const result = await query(args);
      const duration = performance.now() - start;

      // only log warnings in development
      if (process.env.NODE_ENV !== 'production' && duration > SLOW_QUERY_THRESHOLD) {
        console.warn(`‼️  Slow Prisma Query:`, {
          model,
          operation,
          duration: `${Math.round(duration)}ms`
        });
      }

      return result;
    }
  }
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 });

const baseClient = new PrismaClient({
  adapter,
  log: ['warn', 'error']
});

const prisma = baseClient.$extends(queryLoggerExtension);

export default prisma;
