/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';

export const MechanicalPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '001',
      name: 'Mechanical',
      colorHexCode: '#283922',
      dateCreated: new Date(),
      organizationId
    }
  };
};

export const ElectricalPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '002',
      name: 'Electrical',
      colorHexCode: '#278923',
      dateCreated: new Date('2025-01-01T00:00:00Z'),
      organizationId
    }
  };
};

export const StructuralPartTag = (organizationId: string): Prisma.PartTagCreateArgs => {
  return {
    data: {
      partTagId: '003',
      name: 'Structural',
      colorHexCode: '#A133FF',
      dateCreated: new Date(),
      organizationId
    }
  };
};

export const dbSeedAllPartTags = { MechanicalPartTag, ElectricalPartTag, StructuralPartTag };
