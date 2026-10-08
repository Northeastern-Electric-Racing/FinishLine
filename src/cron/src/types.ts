export interface CronJob {
  /** unique name, used in logs */
  name: string;
  /** cron expression, evaluated in America/New_York */
  schedule: string;
  /** backend path to POST to, e.g. /notifications/hourly */
  endpoint: string;
  /** request timeout; defaults to 60s */
  timeoutMs?: number;
}

export const defineJob = (job: CronJob): CronJob => job;
