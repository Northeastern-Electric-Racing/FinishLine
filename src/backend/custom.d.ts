import { Car, Organization } from '@prisma/client';
import { User as SharedUser } from 'shared';

declare global {
  namespace Express {
    export interface Request {
      currentUser: SharedUser;
      organization: Organization;
      currentCar?: Car;
    }
  }
}
