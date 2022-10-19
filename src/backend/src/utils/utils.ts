import { Description_Bullet, WBS_Element, WBS_Element_Status } from '@prisma/client';
import { DescriptionBullet, WbsElementStatus, WbsNumber } from 'shared';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

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

export const generateAccessToken = (user: { firstName: string; lastName: string }) => {
  return jwt.sign(user, process.env.TOKEN_SECRET as string, { expiresIn: '10h' });
};

export const authenticateToken = (req: Request, res: Response, next: any) => {
  // eslint-disable-next-line prefer-destructuring
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Authentication Failed!' });

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any) => {
    console.log(err);
    if (err) return res.status(403).json({ message: 'Authentication Failed!' });
    next();
  });
};

export const requireJwtUnlessLogin = (fn: any) => {
  return function (req: Request, res: Response, next: any) {
    console.log(`COOKIES: ${JSON.stringify(req.cookies)} | COOKIES TOKEN: ${JSON.stringify(req.cookies.token)}`);
    return next();
    if (req.path !== '/users/auth/login') {
      next();
    } else {
      fn(req, res, next);
    }
  };
};
