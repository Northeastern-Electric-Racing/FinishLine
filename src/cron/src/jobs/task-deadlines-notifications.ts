import { defineJob } from '../types.js';

const MINUTE_MS = 60_000;

export default defineJob({
  name: 'daily-notifications',
  schedule: '0 9 * * *',
  endpoint: '/notifications/task-deadlines',
  // In case of slow Slack days, it is good to extend the timeout to account for any delays.
  timeoutMs: 10 * MINUTE_MS
});
