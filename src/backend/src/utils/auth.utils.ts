import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import prisma from '../prisma/prisma';
import { AccessDeniedException, HttpException, NotFoundException } from './errors.utils';
import { Organization, User, User_Secure_Settings, User_Settings } from '@prisma/client';
import { IncomingHttpHeaders } from 'http';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'i<3security';

// generate a jwt using the user's first and last name
export const generateAccessToken = (user: { userId: string; firstName: string; lastName: string }) => {
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
  'Client-Security-Token',
  'organizationId'
];

// middleware function for production that will enforce jwt authorization
export const requireJwtProd = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === '/users/auth/login' || // logins dont have cookies yet
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' // this is a pre-flight request and those don't send cookies
  ) {
    return next();
  } else if (
    req.path.startsWith('/notifications') // task deadline notification endpoint
  ) {
    notificationEndpointAuth(req, res, next);
  } else {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Authentication Failed: Cookie not found!' });

    jwt.verify(token, TOKEN_SECRET, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) return res.status(401).json({ message: 'Authentication Failed: Invalid JWT!' });

      if (!decoded || typeof decoded === 'string') {
        return res.status(401).json({ message: 'Authentication Failed: Invalid JWT payload!' });
      }
      res.locals.userId = decoded.userId;

      return next();
    });
  }
};

// middleware function for development that will enforce jwt authorization
export const requireJwtDev = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === '/users/auth/login/dev' || // logins dont have cookies yet
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
    req.path === '/users' // dev login needs the list of users to log in
  ) {
    next();
  } else if (
    req.path.startsWith('/notifications') // task deadline notification endpoint
  ) {
    notificationEndpointAuth(req, res, next);
  } else {
    const devUserId = req.headers.authorization;

    if (!devUserId) return res.status(401).json({ message: 'Authentication Failed: Not logged in (dev)!' });

    res.locals.userId = devUserId;

    return next();
  }
};

const notificationEndpointAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const { NOTIFICATION_ENDPOINT_SECRET } = process.env;

  if (!NOTIFICATION_ENDPOINT_SECRET) throw new HttpException(500, 'Notification endpoint secret not found!');

  if (!authorization) return res.status(401).json({ message: 'Authentication Failed: Secret not found!' });

  if (authorization !== NOTIFICATION_ENDPOINT_SECRET)
    return res.status(401).json({ message: 'Authentication Failed: Invalid secret!' });

  return next();
};

/**
 * get the user making the request.
 * @param res - we use the response because that's where we stored the userId data during jwt validation
 * @returns the user
 * @throws if no user with the userId exists
 */
export const getCurrentUser = async (res: Response): Promise<User> => {
  const { userId } = res.locals;
  const user = await prisma.user.findUnique({
    where: { userId }
  });
  if (!user) throw new NotFoundException('User', userId);
  return user;
};

export type UserWithSettings = User & {
  userSettings: User_Settings | null;
};

export type UserWithSecureSettings = UserWithSettings & {
  userSecureSettings: User_Secure_Settings | null;
};

export const getOrganization = async (headers: IncomingHttpHeaders): Promise<Organization> => {
  let { organizationid } = headers;

  const isProd = process.env.NODE_ENV === 'production';

  if (organizationid === undefined && !isProd) {
    organizationid = process.env.DEV_ORGANIZATION_ID;
  }

  if (organizationid === undefined) {
    throw new AccessDeniedException('Organization not provided');
  }

  if (typeof organizationid !== 'string') {
    throw new AccessDeniedException('Invalid organization ID');
  }

  const organization = await prisma.organization.findUnique({
    where: { organizationId: organizationid },
    include: {
      advisor: true,
      usefulLinks: true
    }
  });

  if (!organization) {
    throw new NotFoundException('Organization', organizationid);
  }

  return organization;
};

/**
 * Gets the user making the request and includes their user settings
 * @param res - we use the response because that's where we stored the userId data during jwt validation
 * @returns the user with their user settings
 * @throws if no user with the userId exists
 */
export const getCurrentUserWithUserSettings = async (res: Response): Promise<UserWithSecureSettings> => {
  const { userId } = res.locals;
  const user = await prisma.user.findUnique({
    where: { userId },
    include: { userSettings: true, userSecureSettings: true }
  });
  if (!user) throw new NotFoundException('User', userId);
  return user;
};

export const getUserAndOrganization = async (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === '/users/auth/login' || // logins dont have cookies yet
    req.path === '/users/auth/login/dev' ||
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
    req.path === '/users' // dev login needs the list of users to log in
  ) {
    return next();
  }
  try {
    const user = await getCurrentUser(res);
    const organization = await getOrganization(req.headers);
    req.currentUser = user;
    req.organization = organization;
    return next();
  } catch (error) {
    return next(error);
  }
};
