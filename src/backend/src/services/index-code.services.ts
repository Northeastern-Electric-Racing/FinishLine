import { ReimbursementRequest, User, AccountCode, OtherProductReason } from 'shared';
import prisma from '../prisma/prisma';
import indexCodeTransformer from '../transformers/index-code.transformer';

export default class IndexCodeService {
  static async createIndexCode(name: string, user: User) {
    const indexCode = await prisma.index_Code.create({
      data: {
        name,
        userCreated: { connect: { userId: user.userId } }
      }
    });
    return indexCodeTransformer(indexCode);
  }
}
