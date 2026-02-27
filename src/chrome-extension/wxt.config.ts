import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  entrypointsDir: 'entrypoints',
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 3400
    }
  },
  manifest: {
    name: 'FinishLine for Concur',
    description: 'Auto-fill SAP Concur expense reports from FinishLine reimbursement requests',
    permissions: ['storage', 'activeTab', 'identity'],
    host_permissions: [
      'https://www.concursolutions.com/*',
      'https://us2.concursolutions.com/*',
      'http://localhost:3001/*'
    ]
  }
});
