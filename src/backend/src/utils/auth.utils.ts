import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { NotFoundException } from './errors.utils';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'i<3security';

// generate a jwt using the user's first and last name
export const generateAccessToken = (user: { userId: number; firstName: string; lastName: string }) => {
  return jwt.sign(user, TOKEN_SECRET, { expiresIn: '12h' });
};

// headers needed for production
export const prodHeaders = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'XMLHttpRequest',
  'X-Auth-Token',
  'Client-Security-Token'
];

// middleware function for production that will enforce jwt authorization
export const requireJwtProd = (req: Request, res: Response, next: any) => {
  if (
    req.path === '/users/auth/login' || // logins dont have cookies yet
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' // this is a pre-flight request and those don't send cookies
  ) {
    next();
  } else {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Authentication Failed: Cookie not found!' });

    jwt.verify(token, TOKEN_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(401).json({ message: 'Authentication Failed: Invalid JWT!' });

      res.locals.userId = parseInt(decoded.userId);

      next();
    });
  }
};

// middleware function for development that will enforce jwt authorization
export const requireJwtDev = (req: Request, res: Response, next: any) => {
  if (
    req.path === '/users/auth/login/dev' || // logins dont have cookies yet
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
    req.path === '/users' // dev login needs the list of users to log in
  ) {
    next();
  } else {
    const devUserId = req.headers.authorization;

    if (!devUserId) return res.status(401).json({ message: 'Authentication Failed: Not logged in (dev)!' });

    res.locals.userId = parseInt(devUserId);

    next();
  }
};

/**
 * get the user making the request.
 * @param res - we use the response because that's where we stored the userId data during jwt validation
 * @returns the user
 * @throws if no user with the userId exists
 */
export const getCurrentUser = async (res: Response): Promise<User> => {
  const { userId } = res.locals;
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new NotFoundException('User', userId);
  return user;
};
