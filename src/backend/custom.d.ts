import { Organization, Prisma } from '@prisma/client';
import { AuthInfo } from '@modelcontextprotocol/server';
import { User as SharedUser } from 'shared';

declare global {
  namespace Express {
    export interface Request {
      currentUser: SharedUser;
      organization: Organization;
      currentCar?: Prisma.CarGetPayload<{ include: { wbsElement: true } }>;
      /** set by attachAuthInfo and read by the MCP handler via toNodeHandler */
      auth?: AuthInfo;
    }
  }
}
