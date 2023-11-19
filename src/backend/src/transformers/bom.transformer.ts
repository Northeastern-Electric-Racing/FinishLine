import { Prisma } from '@prisma/client';
import { AssemblyPreview, Material, MaterialStatus } from 'shared';
import { assemblyQueryArgs, materialQueryArgs } from '../prisma-query-args/bom.query-args';

export const assemblyTransformer = (assembly: Prisma.AssemblyGetPayload<typeof assemblyQueryArgs>): AssemblyPreview => {
  return {
    assemblyId: assembly.assemblyId,
    name: assembly.name,
    userCreatedId: assembly.userCreatedId,
    userCreated: assembly.userCreated,
    userDeletedId: assembly.userDeletedId ?? undefined,
    userDeleted: assembly.userDeleted ?? undefined,
    wbsElementId: assembly.wbsElementId
  };
};

export const materialTransformer = (material: Prisma.MaterialGetPayload<typeof materialQueryArgs>): Material => {
  return {
    materialId: material.materialId,
    assemblyId: material.assemblyId ?? '',
    assembly: material.assembly ? assemblyTransformer(material.assembly) : undefined,
    name: material.name,
    wbsElementId: material.wbsElementId,
    dateDeleted: material.dateDeleted ?? undefined,
    userDeletedId: material.userDeletedId ?? undefined,
    userDeleted: material.userDeleted ?? undefined,
    dateCreated: material.dateCreated,
    userCreatedId: material.userCreatedId,
    userCreated: material.userCreated,
    status: material.status as MaterialStatus,
    materialTypeName: material.materialTypeName,
    manufacturerName: material.manufacturerName,
    manufacturerPartNumber: material.manufacturerPartNumber,
    price: material.price,
    subtotal: material.subtotal,
    quantity: material.quantity,
    linkUrl: material.linkUrl,
    unitName: material.unitName ?? undefined,
    quantityUnit: material.quantityUnit ?? undefined,
    materialType: material.materialType,
    manufacturer: material.manufacturer,
    notes: material.notes ?? undefined
  };
};
