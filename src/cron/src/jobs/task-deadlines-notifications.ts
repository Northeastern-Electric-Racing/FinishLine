import { defineJob } from '../types.js';

export default defineJob({
  name: 'daily-notifications',
  schedule: '0 9 * * *',
  endpoint: '/notifications/task-deadlines'
});
