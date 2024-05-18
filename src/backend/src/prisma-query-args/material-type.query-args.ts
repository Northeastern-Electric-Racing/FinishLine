/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getMaterialPreviewQueryArgs } from './bom.query-args';

export type MaterialTypeQueryArgs = ReturnType<typeof getMaterialTypeQueryArgs>;

export const getMaterialTypeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Material_TypeArgs>()({
    include: {
      materials: getMaterialPreviewQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
