import { Prisma } from '@prisma/client';
import { Assembly, AssemblyPreview, Material, MaterialPreview, MaterialStatus } from 'shared';
import { AssemblyQueryArgs, MaterialPreviewQueryArgs, MaterialQueryArgs } from '../prisma-query-args/bom.query-args';
import { userTransformer } from './user.transformer';

export const assemblyTransformer = (assembly: Prisma.AssemblyGetPayload<AssemblyQueryArgs>): Assembly => {
  return {
    assemblyId: assembly.assemblyId,
    name: assembly.name,
    userCreated: userTransformer(assembly.userCreated),
    userDeleted: assembly.userDeleted ? userTransformer(assembly.userDeleted) : undefined,
    wbsElementId: assembly.wbsElementId,
    materials: assembly.materials.map(materialPreviewTransformer)
  };
};

const assemblyPreviewTransformer = (assembly: Prisma.AssemblyGetPayload<null>): AssemblyPreview => {
  return {
    ...assembly,
    dateDeleted: assembly.dateDeleted ?? undefined,
    pdmFileName: assembly.pdmFileName ?? undefined
  };
};

export const materialTransformer = (material: Prisma.MaterialGetPayload<MaterialQueryArgs>): Material => {
  return {
    materialId: material.materialId,
    assemblyId: material.assemblyId ?? undefined,
    assembly: material.assembly ? assemblyPreviewTransformer(material.assembly) : undefined,
    name: material.name,
    wbsElementId: material.wbsElementId,
    dateDeleted: material.dateDeleted ?? undefined,
    userDeleted: material.userDeleted ? userTransformer(material.userDeleted) : undefined,
    dateCreated: material.dateCreated,
    userCreated: userTransformer(material.userCreated),
    status: material.status as MaterialStatus,
    materialTypeName: material.materialType?.name,
    manufacturerName: material.manufacturer?.name,
    manufacturerPartNumber: material.manufacturerPartNumber ?? undefined,
    pdmFileName: material.pdmFileName ?? undefined,
    quantity: material.quantity ?? undefined,
    price: material.price ?? undefined,
    subtotal: material.subtotal ?? undefined,
    linkUrl: material.linkUrl ?? undefined,
    unitName: material.unit?.name,
    materialType: material.materialType
      ? {
          ...material.materialType,
          dateDeleted: material.materialType.dateDeleted ?? undefined
        }
      : undefined,
    manufacturer: material.manufacturer
      ? {
          ...material.manufacturer,
          dateDeleted: material.manufacturer.dateDeleted ?? undefined
        }
      : undefined,
    notes: material.notes ?? undefined
  };
};

export const materialPreviewTransformer = (
  material: Prisma.MaterialGetPayload<MaterialPreviewQueryArgs>
): MaterialPreview => {
  return {
    materialId: material.materialId,
    name: material.name,
    wbsElementId: material.wbsElementId,
    dateCreated: material.dateCreated,
    status: material.status as MaterialStatus,
    dateDeleted: material.dateDeleted ?? undefined,
    assemblyId: material.assemblyId ?? undefined,
    pdmFileName: material.pdmFileName ?? undefined,
    manufacturerPartNumber: material.manufacturerPartNumber ?? undefined,
    quantity: material.quantity ?? undefined,
    price: material.price ?? undefined,
    subtotal: material.subtotal ?? undefined,
    linkUrl: material.linkUrl ?? undefined,
    notes: material.notes ?? undefined,
    unitName: material.unit?.name,
    materialTypeName: material.materialType?.name,
    manufacturerName: material.manufacturer?.name
  };
};
