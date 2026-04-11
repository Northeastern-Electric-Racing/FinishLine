/// <reference types="vitest/globals" />
/// <reference path="../../custom.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { createTestCar, createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { getCurrentCar } from '../../src/utils/car.utils.js';
import { NotFoundException } from '../../src/utils/errors.utils.js';
import { supermanAdmin } from '../test-data/users.test-data.js';
import prisma from '../../src/prisma/prisma.js';

describe('getCurrentCar Middleware', () => {
  let orgId: string;

  beforeEach(async () => {
    const org = await createTestOrganization();
    orgId = org.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('calls next() without setting req.currentCar when no carId header is present', async () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getCurrentCar(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.currentCar).toBeUndefined();
  });

  it('sets req.currentCar with wbsElement and calls next() when carId header matches an existing car', async () => {
    const user = await createTestUser(supermanAdmin, orgId);
    const car = await createTestCar(orgId, user.userId);

    const req = { headers: { carid: car.carId }, organization: { organizationId: orgId } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getCurrentCar(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.currentCar).toBeDefined();
    expect(req.currentCar?.carId).toBe(car.carId);
    expect(req.currentCar?.wbsElement).toBeDefined();
  });

  it('calls next() with a NotFoundException when carId header does not match any car', async () => {
    const req = { headers: { carid: 'non-existent-car-id' }, organization: { organizationId: orgId } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getCurrentCar(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
    expect(req.currentCar).toBeUndefined();
  });

  it('calls next() without error and does not set req.currentCar when carId header is an array', async () => {
    const req = { headers: { carid: ['id-one', 'id-two'] } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getCurrentCar(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.currentCar).toBeUndefined();
  });

  it('calls next() with the thrown error when Prisma throws unexpectedly', async () => {
    const dbError = new Error('DB connection lost');
    const spy = vi.spyOn(prisma.car, 'findUnique').mockRejectedValueOnce(dbError);

    const req = { headers: { carid: 'some-car-id' }, organization: { organizationId: orgId } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getCurrentCar(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);

    spy.mockRestore();
  });
});
