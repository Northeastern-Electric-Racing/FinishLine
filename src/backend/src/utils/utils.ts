import { Description_Bullet, WBS_Element, WBS_Element_Status } from '@prisma/client';
import { DescriptionBullet, WbsElementStatus, WbsNumber } from 'shared';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { expressjwt } from 'express-jwt';

export const descBulletConverter = (descBullet: Description_Bullet): DescriptionBullet => ({
  id: descBullet.descriptionId,
  detail: descBullet.detail,
  dateAdded: descBullet.dateAdded,
  dateDeleted: descBullet.dateDeleted ?? undefined
});

export const wbsNumOf = (element: WBS_Element): WbsNumber => ({
  carNumber: element.carNumber,
  projectNumber: element.projectNumber,
  workPackageNumber: element.workPackageNumber
});

export const convertStatus = (status: WBS_Element_Status): WbsElementStatus =>
  ({
    INACTIVE: WbsElementStatus.Inactive,
    ACTIVE: WbsElementStatus.Active,
    COMPLETE: WbsElementStatus.Complete
  }[status]);

export const buildChangeDetail = (thingChanged: string, oldValue: string, newValue: string): string => {
  return `Changed ${thingChanged} from "${oldValue}" to "${newValue}"`;
};

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'i<3security';

// generate a jwt using the user's first and last name
export const generateAccessToken = (user: { firstName: string; lastName: string }) => {
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

// middleware function that will enforce jwt except in some circumstances
export const requireJwt = (req: Request, res: Response, next: any) => {
  if (
    process.env.NODE_ENV !== 'production' || // only on prod
    req.path === '/users/auth/login' || // logins dont have cookies yet
    req.path === '/' || // base route is available so aws can listen and check the health
    req.method === 'OPTIONS' // this is a pre-flight request and those don't send cookies
  ) {
    next();
  } else {
    expressjwt({
      secret: TOKEN_SECRET,
      algorithms: ['HS256'],
      getToken: (req) => req.cookies.token
    })(req, res, next);
  }
};
