/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getMaterialPreviewQueryArgs } from './bom.query-args.js';

export type ManufacturerQueryArgs = ReturnType<typeof getManufacturerQueryArgs>;

export const getManufacturerQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ManufacturerDefaultArgs>()({
    include: {
      materials: getMaterialPreviewQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
