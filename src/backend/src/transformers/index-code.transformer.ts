import { Prisma } from '@prisma/client';
import { IndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { IndexCode } from 'shared';
import { userTransformer } from './user.transformer';

export const indexCodeTransformer = (indexCode: Prisma.Index_CodeGetPayload<IndexCodeQueryArgs>): IndexCode => {
  return {
    indexCodeId: indexCode.indexCodeId,
    name: indexCode.name,
    userCreated: userTransformer(indexCode.userCreated),
    dateCreated: indexCode.dateCreated
  };
};
