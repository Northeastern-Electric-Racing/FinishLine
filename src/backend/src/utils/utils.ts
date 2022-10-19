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
  return jwt.sign(user, process.env.TOKEN_SECRET as string, { expiresIn: '12h' });
};

export const requireJwtUnlessLogin = (fn: any) => {
  return function (req: Request, res: Response, next: any) {
    if (process.env.NODE_ENV !== 'production' || req.path === '/users/auth/login') {
      next();
    } else {
      fn(req, res, next);
    }
  };
};
