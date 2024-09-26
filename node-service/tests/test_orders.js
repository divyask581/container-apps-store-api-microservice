const request = require('supertest');
const express = require('express');
const ordersRouter = require('../routes/orders');

const app = express();
app.use(express.json());
app.use('/orders', ordersRouter);

describe('Orders API', () => {
  it('should fetch all orders with pagination and sorting', async () => {
    const response = await request(app).get('/orders/all?page=1&per_page=10&sort_by=id&sort_order=asc');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter orders by date range', async () => {
    const response = await request(app).get('/orders/filter?start_date=2022-01-01&end_date=2022-12-31');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should search orders by order ID', async () => {
    const response = await request(app).get('/orders/search?order_id=12345');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return error for invalid order ID', async () => {
    const response = await request(app).get('/orders/search?order_id=');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid order ID');
  });

  it('should return error for invalid date range', async () => {
    const response = await request(app).get('/orders/filter?start_date=&end_date=');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid date range');
  });
});
