const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));

test('materisal not found', async () => {
  const response = await request(app).post('/materials/10/delete').set('Authorization', 3);

  expect(response.statusCode).toBe(404);
});
