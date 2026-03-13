import { Prisma } from '@prisma/client';
import { Assembly, Material, MaterialPreview, MaterialStatus } from 'shared';
import { AssemblyQueryArgs, MaterialPreviewQueryArgs, MaterialQueryArgs } from '../prisma-query-args/bom.query-args.js';
import { userTransformer } from './user.transformer.js';
import { reimbursementRequestTransformer } from './reimbursement-requests.transformer.js';

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

export const materialTransformer = (material: Prisma.MaterialGetPayload<MaterialQueryArgs>): Material => {
  return {
    materialId: material.materialId,
    assemblyId: material.assemblyId ?? undefined,
    name: material.name,
    wbsElementId: material.wbsElementId,
    dateDeleted: material.dateDeleted ?? undefined,
    userDeleted: material.userDeleted ? userTransformer(material.userDeleted) : undefined,
    dateCreated: material.dateCreated,
    userCreated: userTransformer(material.userCreated),
    status: material.status as MaterialStatus,
    materialTypeName: material.materialType.name,
    manufacturerName: material.manufacturer ? material.manufacturer.name : undefined,
    manufacturerPartNumber: material.manufacturerPartNumber ?? undefined,
    pdmFileName: material.pdmFileName ?? undefined,
    price: material.price ?? undefined,
    subtotal: material.subtotal ?? undefined,
    quantity: material.quantity ?? undefined,
    linkUrl: material.linkUrl,
    unitName: material.unit?.name ?? undefined,
    materialType: { ...material.materialType, dateDeleted: material.materialType.dateDeleted ?? undefined },
    manufacturer: material.manufacturer
      ? {
          ...material.manufacturer,
          dateDeleted: material.manufacturer.dateDeleted ?? undefined
        }
      : undefined,
    notes: material.notes ?? undefined,
    reimbursementRequests: Array.from(
      new Map(
        material.reimbursementProducts
          .filter((p) => !p.dateDeleted && p.reimbursementRequest)
          .map((p) => [p.reimbursementRequest!.reimbursementRequestId, p.reimbursementRequest!])
      ).values()
    ).map(reimbursementRequestTransformer)
  };
};

export const materialPreviewTransformer = (
  material: Prisma.MaterialGetPayload<MaterialPreviewQueryArgs>
): MaterialPreview => {
  return {
    ...material,
    notes: material.notes ?? undefined,
    dateDeleted: material.dateDeleted ?? undefined,
    assemblyId: material.assemblyId ?? undefined,
    pdmFileName: material.pdmFileName ?? undefined,
    status: material.status as MaterialStatus,
    unitName: material.unit?.name ?? undefined,
    materialTypeName: material.materialType.name,
    manufacturerName: material.manufacturer?.name ?? undefined,
    manufacturerPartNumber: material.manufacturerPartNumber ?? undefined,
    quantity: material.quantity ?? undefined,
    price: material.price ?? undefined,
    subtotal: material.subtotal ?? undefined,
    reimbursementRequests: Array.from(
      new Map(
        material.reimbursementProducts
          .filter((p) => !p.dateDeleted && p.reimbursementRequest)
          .map((p) => [p.reimbursementRequest!.reimbursementRequestId, p.reimbursementRequest!])
      ).values()
    ).map(reimbursementRequestTransformer)
  };
};
