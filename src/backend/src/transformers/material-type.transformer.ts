/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import materialTypeQueryArgs from '../prisma-query-args/material-type.query-args';
import { MaterialType } from 'shared';
import { materialPreviewTransformer } from './material.transformer';

export const materialTypeTransformer = (
  materialType: Prisma.Material_TypeGetPayload<typeof materialTypeQueryArgs>
): MaterialType => {
  return {
    name: materialType.name,
    dateCreated: materialType.dateCreated,
    userCreatedId: materialType.userCreatedId,
    userCreated: materialType.userCreated,
    dateDeleted: materialType.dateDeleted ?? undefined,
    materials: materialType.materials.map(materialPreviewTransformer)
  };
};
