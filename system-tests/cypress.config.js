module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    },
    defaultCommandTimeout: 10000
  },
  env: {
    base_url: 'http://localhost:3000'
  }
};
