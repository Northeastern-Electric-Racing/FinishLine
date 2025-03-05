import { Prisma } from '@prisma/client';
import { IndexCode } from 'shared';
import { IndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { userTransformer } from './user.transformer';

const indexCodeTransformer = (indexCode: Prisma.Index_CodeGetPayload<IndexCodeQueryArgs>): IndexCode => {
  return {
    indexCodeId: indexCode.indexCodeId,
    name: indexCode.name,
    userCreated: userTransformer(indexCode.userCreated)
  };
};

export default indexCodeTransformer;
