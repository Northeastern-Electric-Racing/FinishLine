import { defineJob } from '../types.js';

export default defineJob({
  name: 'hourly-notifications',
  schedule: '0 * * * *',
  endpoint: '/notifications/hourly'
});
