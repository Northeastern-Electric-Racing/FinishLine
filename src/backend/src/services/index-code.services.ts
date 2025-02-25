import prisma from '../prisma/prisma';
import indexCodeTransformer from '../transformers/index-code.transformer';
import { getIndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { User } from '@prisma/client';

export default class IndexCodeService {
  /**
   * Creates an index code with the given name and current user.
   * @param name name of the index code
   * @param user the user creating the index code
   * @returns transformed created index code
   */
  static async createIndexCode(name: string, user: User) {
    const indexCode = await prisma.index_Code.create({
      data: {
        userCreated: { connect: { userId: user.userId } },
        name
      },
      ...getIndexCodeQueryArgs()
    });
    return indexCodeTransformer(indexCode);
  }
}
