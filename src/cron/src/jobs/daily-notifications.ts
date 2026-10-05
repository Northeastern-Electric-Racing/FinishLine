import { defineJob } from '../types.js';

export default defineJob({
  name: 'daily-notifications',
  schedule: '0 10 * * *',
  endpoint: '/notifications/daily'
});
