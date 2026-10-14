import { readdir } from 'node:fs/promises';
import { Cron } from 'croner';
import type { CronJob } from './types.js';

const TZ = 'America/New_York';

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var ${key}`);
  return value;
};

const BACKEND_URL = requireEnv('BACKEND_URL').replace(/\/$/, '');
const SECRET = requireEnv('NOTIFICATION_ENDPOINT_SECRET');

const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);

const runJob = async (job: CronJob) => {
  const started = Date.now();
  try {
    const res = await fetch(`${BACKEND_URL}${job.endpoint}`, {
      method: 'POST',
      headers: { Authorization: SECRET },
      signal: AbortSignal.timeout(job.timeoutMs ?? 60_000)
    });
    const body = await res.text();
    const status = res.ok ? 'ok' : 'FAILED';
    log(`${job.name}: ${status} ${res.status} in ${Date.now() - started}ms ${body.slice(0, 200)}`);
  } catch (err) {
    log(`${job.name}: FAILED ${(err as Error).message}`);
  }
};

const loadJobs = async (): Promise<CronJob[]> => {
  const dir = new URL('./jobs/', import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
  const jobs: CronJob[] = [];

  for (const file of files) {
    try {
      const { default: job } = (await import(new URL(file, dir).href)) as { default: CronJob };
      if (!job?.name || !job.schedule || !job.endpoint) {
        log(`skipping ${file}: missing name, schedule, or endpoint`);
        continue;
      }
      if (jobs.some((j) => j.name === job.name)) {
        log(`skipping ${file}: duplicate job name "${job.name}"`);
        continue;
      }
      jobs.push(job);
    } catch (err) {
      log(`skipping ${file}: failed to load (${(err as Error).message})`);
    }
  }
  return jobs;
};

const jobs = await loadJobs();
const scheduled: Cron[] = [];

for (const job of jobs) {
  try {
    const cron = new Cron(job.schedule, { name: job.name, timezone: TZ, protect: true }, () => runJob(job));
    scheduled.push(cron);
    log(`scheduled ${job.name} (${job.schedule} ${TZ}) → ${job.endpoint}, next run ${cron.nextRun()?.toISOString()}`);
  } catch (err) {
    log(`skipping ${job.name}: invalid schedule "${job.schedule}" (${(err as Error).message})`);
  }
}

if (scheduled.length === 0) log('warning: no jobs scheduled');

const shutdown = () => {
  log('shutting down');
  scheduled.forEach((c) => c.stop());
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
