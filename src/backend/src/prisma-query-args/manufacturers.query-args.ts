/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getMaterialPreviewQueryArgs } from './bom.query-args';

export type ManufacturerQueryArgs = ReturnType<typeof getManufacturerQueryArgs>;

export const getManufacturerQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ManufacturerArgs>()({
    include: {
      materials: getMaterialPreviewQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
