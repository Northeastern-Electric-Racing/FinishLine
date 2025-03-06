import prisma from '../prisma/prisma';
import { getIndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { $Enums, Organization, User } from '@prisma/client';
import { indexCodeTransformer } from '../transformers/reimbursement-requests.transformer';
import { IndexCode } from 'shared';
import { AccessDeniedException, DeletedException, NotFoundException } from '../utils/errors.utils';

export default class IndexCodeService {
  /**
   * Creates an index code with the given name and current user.
   * @param name name of the index code
   * @param user the user creating the index code
   * @returns transformed created index code
   */
  static async createIndexCode(name: string, user: User, organization: Organization) {
    const indexCode = await prisma.index_Code.create({
      data: {
        userCreated: { connect: { userId: user.userId } },
        name
      },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });
    return indexCodeTransformer(indexCode);
  }

  /**
   * Gets the index code with the given id
   * @param indexCodeId The id of the vendor to get
   * @param organizationId The organization the user is currently in
   * @returns The vendor with the given id
   */
  static async getSingleIndexCode(indexCodeId: string, organization: Organization): Promise<IndexCode> {
    const indexCode = await prisma.index_Code.findUnique({
      where: { indexCodeId },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });

    if (!indexCode) throw new NotFoundException('Index Code', indexCodeId);
    if (indexCode.dateDeleted) throw new DeletedException('Index Code', indexCodeId);

    return indexCodeTransformer(indexCode);
  }
}
