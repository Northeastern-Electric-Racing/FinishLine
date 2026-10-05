import { defineJob } from '../types.js';

export default defineJob({
  name: 'hourly-notifications',
  schedule: '* * * * *',
  endpoint: '/notifications/hourly'
});
