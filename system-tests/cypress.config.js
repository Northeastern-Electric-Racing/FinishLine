module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    }
  },
  env: {
    base_url: 'http://localhost:3000'
  }
};
