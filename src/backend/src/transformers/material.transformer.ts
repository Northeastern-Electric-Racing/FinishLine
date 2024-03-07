import { Prisma } from '@prisma/client';
import { Assembly, AssemblyPreview, Material, MaterialPreview, MaterialStatus } from 'shared';
import { assemblyQueryArgs, materialQueryArgs } from '../prisma-query-args/bom.query-args';

export const assemblyTransformer = (assembly: Prisma.AssemblyGetPayload<typeof assemblyQueryArgs>): Assembly => {
  return {
    assemblyId: assembly.assemblyId,
    name: assembly.name,
    userCreatedId: assembly.userCreatedId,
    userCreated: assembly.userCreated,
    userDeletedId: assembly.userDeletedId ?? undefined,
    userDeleted: assembly.userDeleted ?? undefined,
    wbsElementId: assembly.wbsElementId,
    materials: assembly.materials.map(materialPreviewTransformer)
  };
};

const assemblyPreviewTransformer = (assembly: Prisma.AssemblyGetPayload<{}>): AssemblyPreview => {
  return {
    ...assembly,
    userDeletedId: assembly.userDeletedId ?? undefined,
    dateDeleted: assembly.dateDeleted ?? undefined,
    pdmFileName: assembly.pdmFileName ?? undefined
  };
};
export const materialTransformer = (material: Prisma.MaterialGetPayload<typeof materialQueryArgs>): Material => {
  return {
    materialId: material.materialId,
    assemblyId: material.assemblyId ?? undefined,
    assembly: material.assembly ? assemblyPreviewTransformer(material.assembly) : undefined,
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
    pdmFileName: material.pdmFileName ?? undefined,
    price: material.price,
    subtotal: material.subtotal,
    quantity: material.quantity,
    linkUrl: material.linkUrl,
    unitName: material.unitName ?? undefined,
    quantityUnit: material.quantityUnit ?? undefined,
    materialType: { ...material.materialType, dateDeleted: material.materialType.dateDeleted ?? undefined },
    manufacturer: { ...material.manufacturer, dateDeleted: material.manufacturer.dateDeleted ?? undefined },
    notes: material.notes ?? undefined
  };
};

export const materialPreviewTransformer = (material: Prisma.MaterialGetPayload<{}>): MaterialPreview => {
  return {
    ...material,
    userDeletedId: material.userDeletedId ?? undefined,
    dateDeleted: material.dateDeleted ?? undefined,
    assemblyId: material.assemblyId ?? undefined,
    pdmFileName: material.pdmFileName ?? undefined,
    status: material.status as MaterialStatus,
    unitName: material.unitName ?? undefined
  };
};
