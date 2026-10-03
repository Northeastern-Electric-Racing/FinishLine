import { defineJob } from '../types.js';

export default defineJob({
  name: 'hourly-notifications',
  schedule: '7,22,37,52 * * * *',
  endpoint: '/notifications/hourly'
});
