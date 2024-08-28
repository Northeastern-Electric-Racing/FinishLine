import { Organization, User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      currentUser: PrismaUser;
      organization: Organization;
    }
  }
}
